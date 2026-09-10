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
    let api = hidapi::HidApi::new().map_err(|error| error.to_string())?;
    let hid_device = device::open_configuration_device(&api)?;
    let report_id = device::negotiate_report_id(&hid_device)?;
    let control = control_from_id(&control)?;

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
            return Err(
                "System actions need to be mapped to keyboard shortcuts before applying".into(),
            );
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

fn control_from_id(value: &str) -> Result<protocol::Control, String> {
    match value {
        "Dial left" => Ok(protocol::Control::DialLeft),
        "Dial click" => Ok(protocol::Control::DialClick),
        "Dial right" => Ok(protocol::Control::DialRight),
        key if key.starts_with('K') => key[1..]
            .parse::<u8>()
            .ok()
            .filter(|number| (1..=6).contains(number))
            .map(protocol::Control::Key)
            .ok_or_else(|| format!("Unsupported control: {value}")),
        _ => Err(format!("Unsupported control: {value}")),
    }
}
