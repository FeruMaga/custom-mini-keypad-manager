use hidapi::{DeviceInfo, HidApi, HidDevice};
use serde::Serialize;

use crate::protocol::{PRODUCT_ID, REPORT_ID_CANDIDATES, VENDOR_ID};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceStatus {
    pub connected: bool,
    pub vendor_id: Option<u16>,
    pub product_id: Option<u16>,
    pub interface_matched: bool,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceProbe {
    pub connected: bool,
    pub report_id: Option<u8>,
}

pub fn get_status() -> DeviceStatus {
    let api = match HidApi::new() {
        Ok(api) => api,
        Err(error) => return disconnected_with_error(error.to_string()),
    };

    match find_device_info(&api) {
        Some(device) => DeviceStatus {
            connected: true,
            vendor_id: Some(device.vendor_id()),
            product_id: Some(device.product_id()),
            interface_matched: is_configuration_interface(device),
            path: Some(device.path().to_string_lossy().to_string()),
            error: None,
        },
        None => DeviceStatus {
            connected: false,
            vendor_id: None,
            product_id: None,
            interface_matched: false,
            path: None,
            error: None,
        },
    }
}

pub fn probe() -> Result<DeviceProbe, String> {
    let api = HidApi::new().map_err(|error| error.to_string())?;
    let device = open_configuration_device(&api)?;
    let report_id = negotiate_report_id(&device)?;

    Ok(DeviceProbe {
        connected: true,
        report_id: Some(report_id),
    })
}

pub fn open_configuration_device(api: &HidApi) -> Result<HidDevice, String> {
    let info = find_device_info(api).ok_or("Mini keyboard configuration interface not found")?;
 
    log::info!(
        "opening HID device path={} vendor={:#06x} product={:#06x} interface_matched={}",
        info.path().to_string_lossy(),
        info.vendor_id(),
        info.product_id(),
        is_configuration_interface(info)
    );

    info.open_device(api).map_err(|error| error.to_string())
}

pub fn negotiate_report_id(device: &HidDevice) -> Result<u8, String> {
    for report_id in REPORT_ID_CANDIDATES {
        match write_payload(device, report_id, [0; 8]) {
            Ok(()) => {
                log::info!("negotiated report_id={report_id}");
                return Ok(report_id);
            }
            Err(error) => log::warn!("report_id={report_id} candidate failed: {error}"),
        }
    }

    Err("Could not negotiate HID report id".into())
}

const OUTPUT_REPORT_LEN: usize = 64;

pub fn write_payload(device: &HidDevice, report_id: u8, payload: [u8; 8]) -> Result<(), String> {
    let mut report = [0u8; 1 + OUTPUT_REPORT_LEN];
    report[0] = report_id;
    report[1..1 + payload.len()].copy_from_slice(&payload);

    let written = device.write(&report).map_err(|error| error.to_string())?;
    log::info!("wrote report_id={report_id} payload={payload:?} written={written}");
    if written == 0 {
        return Err("HID write returned zero bytes".into());
    }

    std::thread::sleep(std::time::Duration::from_millis(20));

    Ok(())
}

fn find_device_info(api: &HidApi) -> Option<&DeviceInfo> {
    api.device_list()
        .filter(|device| is_candidate_device(device))
        .max_by_key(|device| device_score(device))
}

fn is_candidate_device(device: &DeviceInfo) -> bool {
    device.vendor_id() == VENDOR_ID
        && (device.product_id() == PRODUCT_ID || is_configuration_interface(device))
}

fn device_score(device: &DeviceInfo) -> u8 {
    let mut score = 0;

    if device.product_id() == PRODUCT_ID {
        score += 2;
    }

    if is_configuration_interface(device) {
        score += 3;
    }

    score
}

fn is_configuration_interface(device: &DeviceInfo) -> bool {
    device
        .path()
        .to_string_lossy()
        .to_ascii_lowercase()
        .contains("mi_01")
}

fn disconnected_with_error(error: String) -> DeviceStatus {
    DeviceStatus {
        connected: false,
        vendor_id: None,
        product_id: None,
        interface_matched: false,
        path: None,
        error: Some(error),
    }
}
