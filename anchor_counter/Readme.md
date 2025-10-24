#### Counter Program User Stories

#### User Story-1

- As a User I want to create a Counter with start value 0.

##### Acceptance Criterion

- User is able to create Counter by Paying transaction Fees.

#### User Story-2

- As a User I want to increment the counter by 1.

##### Acceptance Criterion

- User is able to increment the Counter.

#### User Story-3

- As a User, I want to decrement the counter by 1.

##### Acceptance Criterion

- User is able to Decrement the Counter.

#### Architecture Diagram

![alt text](Counter.jpg)

##### Running the Code

##### Clone the repo

```code
git clone https://github.com/anurg/TurbinePB_Q425_anurg.git
```

##### change directory to anchor_counter

```
cd anchor_counter
```

##### Install yarn dependencies

```
yarn install
```

##### Sync Keys

```
anchor keys sync
```

##### Build the Anchor Counter Program

```
anchor build
```

#### Run the typescript tests

```
anchor test
```
