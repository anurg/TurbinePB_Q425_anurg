use chrono::{Datelike, Local, Weekday};

pub fn day_of_week() -> Weekday {
    Local::now().weekday()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_day() {
        assert_eq!(day_of_week(), Weekday::Fri);
    }
}
