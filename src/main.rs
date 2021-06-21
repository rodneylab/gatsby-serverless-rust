use netlify_lambda_http::{
    handler,
    lambda::{run, Context},
    IntoResponse, Request,
};
use photon_rs::Rgb;
use serde::Deserialize;
use serde_json::json;

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler(respond_with_contrast_ratios)).await?;
    Ok(())
}

#[derive(Deserialize)]
struct ClientRequest {
    colours: Vec<String>,
}

fn contrast_ratio_from_relative_luminance(
    relative_luminance_1: &f64,
    relative_luminance_2: &f64,
) -> f64 {
    if relative_luminance_1 < relative_luminance_2 {
        (relative_luminance_2 + 0.05) / (relative_luminance_1 + 0.05)
    } else {
        (relative_luminance_1 + 0.05) / (relative_luminance_2 + 0.05)
    }
}

fn contrast_ratio(colour_1: &Rgb, colour_2: &Rgb) -> f64 {
    contrast_ratio_from_relative_luminance(
        &relative_luminance(colour_1),
        &relative_luminance(colour_2),
    )
}

/// convert either #000 or #000000 format colour to photon_rs::Rgb
fn get_rgb_from_hex(hex_string: &str) -> photon_rs::Rgb {
	let colour_hex = hex_string.trim();
	let hex_string_length = Some(hex_string.len());
	match hex_string_length {
			Some(7) => {
					let r = hex_to_decimal(&colour_hex[1..3]);
					let g = hex_to_decimal(&colour_hex[3..5]);
					let b = hex_to_decimal(&colour_hex[5..7]);
					Rgb::new(r, g, b)
			}
			Some(4) => {
					let r_hex = &colour_hex[1..2];
					let g_hex = &colour_hex[2..3];
					let b_hex = &colour_hex[3..4];
					let long_format_hex =
							format!("#{}{}{}{}{}{}", r_hex, r_hex, g_hex, g_hex, b_hex, b_hex);
					get_rgb_from_hex(&long_format_hex)
			}
			_ => panic!("Check rgb input"),
	}
}

/// convert an octet from hex to decimal
fn hex_to_decimal(hex_string: &str) -> u8 {
	let result = match u8::from_str_radix(&hex_string, 16) {
			Ok(num) => num,
			Err(_) => 0,
	};
	result
}

fn relative_luminance_from_colour_ratio(colour_ratio: &RgbRatio) -> f64 {
	let linear_r = if colour_ratio.get_red() <= 0.03928 {
			colour_ratio.get_red() / 12.92
	} else {
			((colour_ratio.get_red() + 0.055) / 1.055).powf(2.4)
	};
	let linear_g = if colour_ratio.get_green() <= 0.03928 {
			colour_ratio.get_green() / 12.92
	} else {
			((colour_ratio.get_green() + 0.055) / 1.055).powf(2.4)
	};
	let linear_b = if colour_ratio.get_blue() <= 0.03928 {
			colour_ratio.get_blue() / 12.92
	} else {
			((colour_ratio.get_blue() + 0.055) / 1.055).powf(2.4)
	};
	0.2126 * linear_r + 0.7152 * linear_g + 0.0722 * linear_b
}

fn relative_luminance(colour: &Rgb) -> f64 {
    let standard_rgb_colour = rgb_ratio(colour);
    relative_luminance_from_colour_ratio(&standard_rgb_colour)
}

async fn respond_with_contrast_ratios(
    request: Request,
    _: Context,
) -> Result<impl IntoResponse, Error> {
    let body = request.body();
    let body: ClientRequest = serde_json::from_slice(&body)?;
    let colours = body.colours;

    let mut result = Vec::new();
    let mut rgb_colours = Vec::new();

    for (i, value_i) in colours.iter().enumerate() {
        rgb_colours.push(get_rgb_from_hex(&colours[i]));
        for (j, value_j) in colours.iter().enumerate() {
            if j < i {
                result.push(json!({ "color": value_i, "backgroundColor": value_j, "contrastRatio": contrast_ratio(&rgb_colours[i], &rgb_colours[j])}));
            }
        }
    }

    Ok(json!({ "contrastRatios": result }))
}

#[derive(Debug, PartialEq)]
struct RgbRatio {
    r: f64,
    g: f64,
    b: f64,
}

impl RgbRatio {
    fn get_red(&self) -> f64 {
        self.r
    }
    fn get_green(&self) -> f64 {
        self.g
    }
    fn get_blue(&self) -> f64 {
        self.b
    }
}

fn rgb_ratio(colour: &Rgb) -> RgbRatio {
    RgbRatio {
        r: colour.get_red() as f64 / 255.0,
        g: colour.get_green() as f64 / 255.0,
        b: colour.get_blue() as f64 / 255.0,
    }
}
