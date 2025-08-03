import sliderData from "./slider-Data.js";

const config = {
    SCROLL_SPEED: 1.75,
    LERP_SPEED: 0.05,
    MAX_VELOCITY: 150,
};

const totalSlideCount = sliderData.length;

const state = {
    currentX: 0,
    targetX: 0,
    slideWidth: 300,
    slides: [],
    isDragging: false,
    startX: 0,
    lastX: 0,
    lastMouseX: 0,
    lastScrollTime: Date.now(),
    isMoving: false,
    velocity: 0,
    lastCurrentX: 0,
    dragDistance: 0,
    hasActuallyDragged: false,
    isMobile: false,
};

function checkMobile() {
    state.isMobile = window.innerWidth < 1000;
}

function createSlideElement(index) {
    const slide = document.createElement("div");
    slide.className = "slide";

    if (state.isMobile) {
        slide.style.width = "175px";
        slide.style.height = "250px";
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "slide-image";

    const img = document.createElement("img");
    const dataIndex = index % totalSlideCount;
    img.src = sliderData[dataIndex].img;
    img.alt = sliderData[dataIndex].title;

    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";

    const title = document.createElement("p");
    title.className = "project-title";
    title.textContent = sliderData[dataIndex].title;

    const arrow = document.createElement("div");
    arrow.className = "project-arrow";
    arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>`;

    slide.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
            window.location.href = sliderData[dataIndex].url;
        }
    });

    overlay.appendChild(title);
    overlay.appendChild(arrow);
    imageContainer.appendChild(img);
    slide.appendChild(imageContainer);
    slide.appendChild(overlay);

    return slide;
}

function initializeSlides() {
    const track = document.querySelector(".slide-track");
    track.innerHTML = ""; // Clear existing slides
    state.slides = [];

    checkMobile();
    state.slideWidth = state.isMobile ? 215 : 390;

    const copies = 6;
    const totalSlides = totalSlideCount * copies;

    for (let i = 0; i < totalSlides; i++) {
        const slide = createSlideElement(i);
        track.appendChild(slide);
        state.slides.push(slide);
    }

    const startOffset = -(totalSlideCount * state.slideWidth * 2);
    state.currentX = startOffset;
    state.targetX = startOffset;
}

function updateSlidePositions() {
    const track = document.querySelector(".slide-track");
    const sequenceWidth = state.slideWidth * totalSlideCount;

    if (state.currentX > -sequenceWidth * 1) {
        state.currentX = -sequenceWidth;
        state.targetX = -sequenceWidth;
    } else if (state.currentX < -sequenceWidth * 4) {
        state.currentX += sequenceWidth;
        state.targetX += sequenceWidth;
    }

    track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
}

function updateParallax() {
    const viewportCenter = window.innerWidth / 2;

    state.slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (!img) return;

        const slideRect = slide.getBoundingClientRect();

        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
            return;
        }

        const slideCenter = slideRect.left + slideRect;
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;

        img.style.transform = `translateX(${parallaxOffset}px scale(2.25))`;
    });
}

function updateMovingState() {
    state.velocity = Math.abs(state.currentX - state.lastCurrentX);
    state.lastCurrentX = state.currentX;

    const isSlowEnough = state.velocity < 0.1;
    const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;

    state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

    document.documentElement.style.setProperty("--slider-moving", state.isMoving ? "1" : "0");
}

function animate() {
    state.currentX += (state.targetX - state.currentX) * config.LERP_SPEED;

    updateMovingState();
    updateSlidePositions();
    updateParallax();

    requestAnimationFrame(updateFunc);
}

function handleWheel(e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
    }

    e.preventDefault();
    state.lastScrollTime = Date.now();
    const scrollDelta = e.deltaY * config.SCROLL_SPEED;
    state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY);
    animate();
}

function handleTouchStart(e) {
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasAcutallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;

    const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
    state.targetX = state.lastX + deltaX;
    state.dragDistance = Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleTouchEnd() {
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false;
    }, 100);
}

function handleMouseDown(e) {
    e.preventDefault();
    state.isDragging = true;
    state.startX = e.clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleMouseMove(e) {
    if (!state.isDragging) return;

    e.preventDefault();
    const deltaX = (e.clientX - state.lastMouseX) * 2;
    state.targetx += deltaX;
    state.lastMouseX = e.clientX;
    state.dragDistance += Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleMouseUp() {
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false;
    }, 100); 
}

function handleResize() {
    initializeSlides();
}

function initializeEventListeners() {
    const slider = document.querySelector(".slider");

    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.addEventListener("touchstart", handleTouchStart);
    slider.addEventListener("touchmove", handleTouchMove);
    slider.addEventListener("touchend", handleTouchEnd);
    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseUp);
    slider.addEventListener("dragstart", (e) => e.preventDefault());

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
}

function initializeSlider() {
    initializeSlides();
    initializeEventListeners();
    animate();
}

document.addEventListener("DOMContentLoaded", initializeSlider);