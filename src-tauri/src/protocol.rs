pub const VENDOR_ID: u16 = 0x1189;
pub const PRODUCT_ID: u16 = 0x8890;

pub const DEFAULT_LAYER: u8 = 1;
pub const REPORT_ID_CANDIDATES: [u8; 3] = [3, 0, 2];

const TYPE_KEYBOARD: u8 = 0x01;
const TYPE_MEDIA: u8 = 0x02;
const TYPE_MOUSE: u8 = 0x03;
const TYPE_LED: u8 = 0x08;

pub enum Control {
    Key(u8),
    DialLeft,
    DialClick,
    DialRight,
}

impl Control {
    pub fn id(&self) -> u8 {
        match self {
            Self::Key(number) => *number,
            Self::DialLeft => 13,
            Self::DialClick => 14,
            Self::DialRight => 15,
        }
    }
}

pub enum MediaAction {
    PreviousTrack,
    NextTrack,
    PlayPause,
    Mute,
    VolumeUp,
    VolumeDown,
}

impl MediaAction {
    fn report_three_code(&self) -> u8 {
        match self {
            Self::PreviousTrack => 182,
            Self::NextTrack => 181,
            Self::PlayPause => 205,
            Self::Mute => 226,
            Self::VolumeUp => 233,
            Self::VolumeDown => 234,
        }
    }
}

pub fn layer_payload(layer: u8) -> [u8; 8] {
    [0xA1, normalize_layer(layer), 0, 0, 0, 0, 0, 0]
}

pub fn keyboard_payloads(
    control: Control,
    report_id: u8,
    layer: u8,
    keys: &[String],
) -> Result<Vec<[u8; 8]>, String> {
    let key = keys
        .iter()
        .find(|key| !is_modifier(key))
        .ok_or("Choose a keyboard key before applying")?;
    let key_binding = key_binding(key).ok_or_else(|| format!("Unsupported keyboard key: {key}"))?;
    let modifier = modifier_byte(keys) | key_binding.modifier;
    let header = header_byte(report_id, layer, TYPE_KEYBOARD);

    Ok(vec![
        [control.id(), header, 1, 0, modifier, 0, 0, 0],
        [
            control.id(),
            header,
            1,
            1,
            modifier,
            key_binding.usage,
            0,
            0,
        ],
    ])
}

pub fn media_payload(control: Control, report_id: u8, layer: u8, action: MediaAction) -> [u8; 8] {
    [
        control.id(),
        header_byte(report_id, layer, TYPE_MEDIA),
        action.report_three_code(),
        0,
        0,
        0,
        0,
        0,
    ]
}

pub fn mouse_payload(
    control: Control,
    report_id: u8,
    layer: u8,
    action: &str,
) -> Result<[u8; 8], String> {
    let data = match action {
        "Left Click" => [1, 0, 0, 0, 0],
        "Middle Click" => [4, 0, 0, 0, 0],
        "Right Click" => [2, 0, 0, 0, 0],
        "Scroll Up" => [0, 0, 0, 1, 0],
        "Scroll Down" => [0, 0, 0, 255, 0],
        _ => return Err(format!("Unsupported mouse action: {action}")),
    };

    Ok([
        control.id(),
        header_byte(report_id, layer, TYPE_MOUSE),
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        0,
    ])
}

pub fn led_payload(report_id: u8, layer: u8, mode: u8) -> Result<[u8; 8], String> {
    if mode > 2 {
        return Err(format!("Unsupported LED mode: {mode}"));
    }

    Ok([
        176,
        header_byte(report_id, layer, TYPE_LED),
        mode,
        0,
        0,
        0,
        0,
        0,
    ])
}

pub fn commit_payload() -> [u8; 8] {
    [0xAA, 0xAA, 0, 0, 0, 0, 0, 0]
}

pub fn led_commit_payload() -> [u8; 8] {
    [0xAA, 0xA1, 0, 0, 0, 0, 0, 0]
}

pub fn media_action(value: &str) -> Option<MediaAction> {
    match value {
        "Previous Track" => Some(MediaAction::PreviousTrack),
        "Next Track" => Some(MediaAction::NextTrack),
        "Play / Pause" => Some(MediaAction::PlayPause),
        "Mute" => Some(MediaAction::Mute),
        "Volume Up" => Some(MediaAction::VolumeUp),
        "Volume Down" => Some(MediaAction::VolumeDown),
        _ => None,
    }
}

fn header_byte(report_id: u8, layer: u8, action_type: u8) -> u8 {
    if report_id == 0 {
        action_type & 0x0F
    } else {
        (normalize_layer(layer) << 4) | action_type
    }
}

fn normalize_layer(layer: u8) -> u8 {
    layer.clamp(1, 3)
}

fn is_modifier(key: &str) -> bool {
    matches!(key, "Ctrl" | "Shift" | "Alt" | "Win")
}

fn modifier_byte(keys: &[String]) -> u8 {
    keys.iter().fold(0, |modifiers, key| {
        modifiers
            | match key.as_str() {
                "Ctrl" => 0x01,
                "Shift" => 0x02,
                "Alt" => 0x04,
                "Win" => 0x08,
                _ => 0,
            }
    })
}

struct KeyBinding {
    usage: u8,
    modifier: u8,
}

fn key_binding(key: &str) -> Option<KeyBinding> {
    match key {
        "~" => shifted_binding(53),
        "!" => shifted_binding(30),
        "@" => shifted_binding(31),
        "#" => shifted_binding(32),
        "$" => shifted_binding(33),
        "%" => shifted_binding(34),
        "^" => shifted_binding(35),
        "&" => shifted_binding(36),
        "*" => shifted_binding(37),
        "(" => shifted_binding(38),
        ")" => shifted_binding(39),
        "_" => shifted_binding(45),
        "+" => shifted_binding(46),
        "{" => shifted_binding(47),
        "}" => shifted_binding(48),
        "|" => shifted_binding(49),
        ":" => shifted_binding(51),
        "\"" => shifted_binding(52),
        "<" => shifted_binding(54),
        ">" => shifted_binding(55),
        "?" => shifted_binding(56),
        _ => key_usage(key).map(|usage| KeyBinding { usage, modifier: 0 }),
    }
}

fn key_usage(key: &str) -> Option<u8> {
    match key {
        "A" => Some(4),
        "B" => Some(5),
        "C" => Some(6),
        "D" => Some(7),
        "E" => Some(8),
        "F" => Some(9),
        "G" => Some(10),
        "H" => Some(11),
        "I" => Some(12),
        "J" => Some(13),
        "K" => Some(14),
        "L" => Some(15),
        "M" => Some(16),
        "N" => Some(17),
        "O" => Some(18),
        "P" => Some(19),
        "Q" => Some(20),
        "R" => Some(21),
        "S" => Some(22),
        "T" => Some(23),
        "U" => Some(24),
        "V" => Some(25),
        "W" => Some(26),
        "X" => Some(27),
        "Y" => Some(28),
        "Z" => Some(29),
        "1" => Some(30),
        "2" => Some(31),
        "3" => Some(32),
        "4" => Some(33),
        "5" => Some(34),
        "6" => Some(35),
        "7" => Some(36),
        "8" => Some(37),
        "9" => Some(38),
        "0" => Some(39),
        "Enter" => Some(40),
        "Esc" => Some(41),
        "Backspace" => Some(42),
        "Tab" => Some(43),
        "Space" => Some(44),
        "-" => Some(45),
        "=" => Some(46),
        "[" => Some(47),
        "]" => Some(48),
        "\\" => Some(49),
        ";" => Some(51),
        "'" => Some(52),
        "`" => Some(53),
        "," => Some(54),
        "." => Some(55),
        "/" => Some(56),
        "Caps" => Some(57),
        "F1" => Some(58),
        "F2" => Some(59),
        "F3" => Some(60),
        "F4" => Some(61),
        "F5" => Some(62),
        "F6" => Some(63),
        "F7" => Some(64),
        "F8" => Some(65),
        "F9" => Some(66),
        "F10" => Some(67),
        "F11" => Some(68),
        "F12" => Some(69),
        "PrtSc" => Some(70),
        "Scroll" => Some(71),
        "Pause" => Some(72),
        "Insert" => Some(73),
        "Home" => Some(74),
        "Page Up" => Some(75),
        "Delete" => Some(76),
        "End" => Some(77),
        "Page Down" => Some(78),
        "Right" => Some(79),
        "Left" => Some(80),
        "Down" => Some(81),
        "Up" => Some(82),
        "Num Lock" => Some(83),
        "Menu" => Some(101),
        _ => None,
    }
}

fn shifted_binding(usage: u8) -> Option<KeyBinding> {
    Some(KeyBinding {
        usage,
        modifier: 0x02,
    })
}
