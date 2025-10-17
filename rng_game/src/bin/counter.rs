use std::io;
use std::{thread::sleep, time::Duration};
fn main() {
    let now = std::time::Instant::now();
    let mut counter = Box::new(0);
    'outer: loop {
        for _i in [0..1000000] {
            *counter += 1;
            sleep(Duration::new(0, 100000000));
            println!("{}", counter);
            if *counter % 10 == 0 {
                println!("Do you want counter to stop(y/n)?");
                let result = io::stdin().lines().next().unwrap().unwrap();
                if result == "y" {
                    break 'outer;
                }
            }
        }
    }
    let result = now.elapsed();
    println!("Program executed in seconds: {:?}", result);
}
