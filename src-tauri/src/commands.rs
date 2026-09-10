use serde::{Deserialize, Serialize};

use crate::{device, protocol};

#[derive(Debug, Deserialize)]
pub struct AssignmentPayload {
    category: String,
    keys: Vec<String>,
    led: Option<LedPayload>,
}

#[derive(Debug, Deserialize)]
pub struct LedPayload {
    mode: u8,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplyResult {
    report_id: u8,
}

#[tauri::command]
pub fn get_device_status() -> device::DeviceStatus {
    device::get_status()
}

#[tauri::command]
pub fn probe_device() -> Result<device::DeviceProbe, String> {
    device::probe()
}

#[tauri::command]
pub fn apply_assignment(
    control: String,
    assignment: AssignmentPayload,
) -> Result<ApplyResult, String> {
    
    log::info!(
        "apply_assignment control={control} category={}",
        assignment.category
    );

    let api = hidapi::HidApi::new().map_err(|error| error.to_string())?;
    let hid_device = device::open_configuration_device(&api)?;
    let report_id = device::negotiate_report_id(&hid_device)?;
    let control = control_from_id(&control)?;
    log::info!("resolved control id={}", control.id());

    if report_id != 0 {
        device::write_payload(
            &hid_device,
            report_id,
            protocol::layer_payload(protocol::DEFAULT_LAYER),
        )?;
    }

    match assignment.category.as_str() {
        "Keyboard" => {
            for payload in protocol::keyboard_payloads(
                control,
                report_id,
                protocol::DEFAULT_LAYER,
                &assignment.keys,
            )? {
                device::write_payload(&hid_device, report_id, payload)?;
            }
            device::write_payload(&hid_device, report_id, protocol::commit_payload())?;
        }
        "Media" => {
            let action = assignment
                .keys
                .first()
                .and_then(|key| protocol::media_action(key))
                .ok_or("Choose a supported media action before applying")?;
            let payload =
                protocol::media_payload(control, report_id, protocol::DEFAULT_LAYER, action);
            device::write_payload(&hid_device, report_id, payload)?;
            device::write_payload(&hid_device, report_id, protocol::commit_payload())?;
        }
        "Mouse" => {
            let action = assignment
                .keys
                .first()
                .ok_or("Choose a mouse action before applying")?;
            let payload =
                protocol::mouse_payload(control, report_id, protocol::DEFAULT_LAYER, action)?;
            device::write_payload(&hid_device, report_id, payload)?;
            device::write_payload(&hid_device, report_id, protocol::commit_payload())?;
        }
        "LED" => {
            let mode = assignment
                .led
                .as_ref()
                .map(|led| led.mode)
                .ok_or("Choose an LED mode before applying")?;
            let payload = protocol::led_payload(report_id, protocol::DEFAULT_LAYER, mode)?;
            device::write_payload(&hid_device, report_id, payload)?;
            device::write_payload(&hid_device, report_id, protocol::led_commit_payload())?;
        }
        "System" => {
            let action = assignment
                .keys
                .first()
                .ok_or("Choose a system action before applying")?;

            if let Some(media_action) = protocol::media_action(action) {
                let payload =
                    protocol::media_payload(control, report_id, protocol::DEFAULT_LAYER, media_action);
                device::write_payload(&hid_device, report_id, payload)?;
                device::write_payload(&hid_device, report_id, protocol::commit_payload())?;
            } else {
                let shortcut = protocol::system_shortcut(action)
                    .ok_or_else(|| format!("Unsupported system action: {action}"))?;
                let keys: Vec<String> = shortcut.iter().map(|key| key.to_string()).collect();

                for payload in protocol::keyboard_payloads(
                    control,
                    report_id,
                    protocol::DEFAULT_LAYER,
                    &keys,
                )? {
                    device::write_payload(&hid_device, report_id, payload)?;
                }
                device::write_payload(&hid_device, report_id, protocol::commit_payload())?;
            }
        }
        _ => {
            return Err(format!(
                "Unsupported assignment category: {}",
                assignment.category
            ))
        }
    }

    Ok(ApplyResult { report_id })
}

// The physical PCB wiring for K1..K6 does not match their on-screen numbering.
// Measured by assigning each on-screen key a distinct digit and pressing the
// physical keys to see which digit came out.
fn control_from_id(value: &str) -> Result<protocol::Control, String> {
    match value {
        "Dial left" => Ok(protocol::Control::DialLeft),
        "Dial click" => Ok(protocol::Control::DialClick),
        "Dial right" => Ok(protocol::Control::DialRight),
        "K1" => Ok(protocol::Control::Key(3)),
        "K2" => Ok(protocol::Control::Key(6)),
        "K3" => Ok(protocol::Control::Key(2)),
        "K4" => Ok(protocol::Control::Key(5)),
        "K5" => Ok(protocol::Control::Key(1)),
        "K6" => Ok(protocol::Control::Key(4)),
        _ => Err(format!("Unsupported control: {value}")),
    }
}
