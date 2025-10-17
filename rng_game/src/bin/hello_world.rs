use chrono::{Datelike, Local};

fn main() {
    let now = std::time::Instant::now();

    let result = Local::now().weekday();
    println!(" Hello World! - Today is - {:?}", result);

    let result = now.elapsed();
    println!("Program executed in seconds: {:?}", result);
}
