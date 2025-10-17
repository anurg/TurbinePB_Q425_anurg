use rng_game::day_of_week;

fn main() {
    let now = std::time::Instant::now();
    let result = day_of_week().to_string();
    println!(" Hello World! - Today is - {:?}", result);
    let result = now.elapsed();
    println!("Program executed in seconds: {:?}", result);
}
