
export function word_generator() {

    const words = [
    "sun", "moon", "star", "cloud", "rain", "rainbow", "tree", "flower", "leaf", "mountain",
    "river", "ocean", "island", "volcano", "desert", "house", "hut", "castle", "bridge", "road",
    "car", "bus", "train", "airplane", "boat", "bicycle", "rocket", "robot", "computer", "phone",
    "book", "pencil", "pen", "eraser", "backpack", "clock", "key", "lock", "door", "window",
    "chair", "table", "bed", "lamp", "fan", "television", "camera", "microphone", "headphones", "speaker",
    "apple", "banana", "mango", "orange", "grapes", "cake", "pizza", "bread", "icecream", "cup",
    "bottle", "plate", "spoon", "fork", "knife", "dog", "cat", "fish", "bird", "butterfly",
    "bee", "ant", "elephant", "lion", "tiger", "horse", "cow", "sheep", "chicken", "turtle",
    "snake", "spider", "crab", "octopus", "ball", "hat", "glasses", "umbrella", "flag", "gift",
    "candle", "balloon", "drum", "guitar", "piano", "helmet", "shoe", "sock", "ring", "crown"
]

    const randomNum1 = Math.floor(Math.random() * words.length)
    const randomNum2 = Math.floor(Math.random() * words.length)
    const randomNum3 = Math.floor(Math.random() * words.length)

    // console.log(randomNum1)
    // console.log(randomNum2)
    // console.log(randomNum3)


    return   { "r1": words[randomNum1]!, "r2": words[randomNum2], "r3": words[randomNum3] }
}
