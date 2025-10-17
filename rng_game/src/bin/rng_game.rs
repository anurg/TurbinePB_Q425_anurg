use rand::Rng;

fn main() {
    let mut rng = rand::rng();
    let x = rng.random_range(1..100);

    println!("The random number generated is : {x}");
}
