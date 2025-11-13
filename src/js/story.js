const containerElement = document.getElementById("container");
const imagesContainerElement = document.getElementById("images");
const imageElements = imagesContainerElement.getElementsByTagName("img");
const firstImageElement = imageElements.item(0);
const progressElement = document.getElementById("progress");

const gap = 20;
const maxIndex = imageElements.length - 1;

let currentIndex = 0;
let mitteInContainer = 0;
let startX = 0;

let containerWidth = containerElement.clientWidth;
let imagesWidth = imagesContainerElement.clientWidth;
let imageWidth = firstImageElement.clientWidth;

// const duration = 5000;
// let progress = 0;
// let progressStart = 0;
// let interval = undefined;
// let progressInterval = undefined;

let i = 0;
for (let el of imageElements) {
    el.setAttribute("index", i);
    el.addEventListener("click", (el) => move(el.target.getAttribute("index")));
    i++;
}

const setAllImagesInactive = () => {
    for (let el of imageElements) {
        el.classList.remove("active");
    }
};

const init = (index) => {
    currentIndex = index;

    setAllImagesInactive();

    containerWidth = document.getElementById("container").clientWidth;
    imagesWidth = imagesContainerElement.clientWidth;
    imageWidth = firstImageElement.clientWidth;

    mitteInContainer = containerWidth / 2;
    startX = mitteInContainer - imageWidth / 2;

    imagesContainerElement.style.gap = `${gap}px`;
    // imagesContainerElement.style.transform = `translateX(${startX}px)`;
    // imageElements.item(index).classList.add("active");
    move(currentIndex);

    console.log("containerWidth", containerWidth);
    console.log("mitteInContainer", mitteInContainer);
    console.log("imagesWidth", imagesWidth);
    console.log("imageWidth", imageWidth);
    console.log("startX", startX);
};

const move = (index) => {
    if (index <= maxIndex && index >= 0) {
        currentIndex = index;
        const newX = startX - currentIndex * (imageWidth + gap);
        console.log("Move to Index =", index, ", X-Translation =", newX);
        imagesContainerElement.style.transform = `translateX(${newX}px)`;

        setAllImagesInactive();
        imageElements[index].classList.add("active");
    }
};

// const reset = () => {
//     clearInterval(interval);
//     clearInterval(progressInterval);
// };
// const play = () => {
//     if (interval) {
//         interval.play();
//         progressInterval.play();
//     } else {
//         interval = setInterval(() => {
//             if (currentIndex >= maxIndex) {
//                 reset();
//             }
//             progressStart = Date.now();
//             move(currentIndex + 1);
//         }, duration);
//         progressInterval = setInterval(() => {
//             progress = ((Date.now() - progressStart) / duration) * 100;
//             progressElement.style.width = `${progress}%`;
//         }, 20);
//     }
// };
// const pause = () => {
//     if (interval) {
//         interval.pause();
//         progressInterval.pause();
//     }
// };

// reset();
// play();

init(0);

window.forward = () => move(currentIndex + 1);
window.backward = () => move(currentIndex - 1);
window.close = () => {};

addEventListener("keyup", (event) => {
    if (event.key == "ArrowRight") {
        move(currentIndex + 1);
    }
    if (event.key == "ArrowLeft") {
        move(currentIndex - 1);
    }
});

addEventListener("resize", () => {
    init(currentIndex);
});

// Swipe

document.addEventListener(
    "touchstart",
    (evt) => {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    },
    false,
);

document.addEventListener(
    "touchmove",
    (evt) => {
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            /*most significant*/
            if (xDiff > 0) {
                move(currentIndex + 1);
            } else {
                move(currentIndex - 1);
            }
        } else {
            if (yDiff > 0) {
                document.dispatchEvent("swipeDown");
            } else {
                document.dispatchEvent("swipeUp");
            }
        }

        xDown = null;
        yDown = null;
    },
    false,
);

let xDown = null;
let yDown = null;
