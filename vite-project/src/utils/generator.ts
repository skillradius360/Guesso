
export function word_generator() {

    const words = [
    "Sun", "Moon", "Star", "Cloud", "Rain", "Rainbow", "Tree", "Flower", "Leaf", "Mountain",
    "River", "Ocean", "Island", "Volcano", "Desert", "House", "Hut", "Castle", "Bridge", "Road",
    "Car", "Bus", "Train", "Airplane", "Boat", "Bicycle", "Rocket", "Robot", "Computer", "Phone",
    "Book", "Pencil", "Pen", "Eraser", "Backpack", "Clock", "Key", "Lock", "Door", "Window",
    "Chair", "Table", "Bed", "Lamp", "Fan", "Television", "Camera", "Microphone", "Headphones", "Speaker",
    "Apple", "Banana", "Mango", "Orange", "Grapes", "Cake", "Pizza", "Bread", "IceCream", "Cup",
    "Bottle", "Plate", "Spoon", "Fork", "Knife", "Dog", "Cat", "Fish", "Bird", "Butterfly",
    "Bee", "Ant", "Elephant", "Lion", "Tiger", "Horse", "Cow", "Sheep", "Chicken", "Turtle",
    "Snake", "Spider", "Crab", "Octopus", "Ball", "Hat", "Glasses", "Umbrella", "Flag", "Gift",
    "Candle", "Balloon", "Drum", "Guitar", "Piano", "Helmet", "Shoe", "Sock", "Ring", "Crown"
]

    const randomNum1 = Math.floor(Math.random() * words.length)
    const randomNum2 = Math.floor(Math.random() * words.length)
    const randomNum3 = Math.floor(Math.random() * words.length)

    console.log(randomNum1)
    console.log(randomNum2)
    console.log(randomNum3)


    return   { "r1": words[randomNum1]!, "r2": words[randomNum2], "r3": words[randomNum3] }
}
