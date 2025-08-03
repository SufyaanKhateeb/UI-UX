import slides from './slides.js';

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(SplitText);
    const totalSlides = slides.length;
    let currentSlide = 1;

    let isAnimating = false;
    let scrollAllowed = true;
    let lastScrollTime = 0;

    function createSlide(slideIndex) {
        const slideData = slides[slideIndex - 1];

        const slide = document.createElement('div');
        slide.classList.add('slide');

        const slideImg = document.createElement('div');
        slideImg.className = 'slide-img';
        const img = document.createElement('img');
        img.src = slideData.slideImg;
        img.alt = "";
        slideImg.appendChild(img);

        const slideHeader = document.createElement('div');
        slideHeader.className = 'slide-header';

        const slideTitle = document.createElement('div');
        slideTitle.className = 'slide-title';
        const h1 = document.createElement('h1');
        h1.textContent = slideData.slideTitle;
        slideTitle.appendChild(h1);

        const slideDescription = document.createElement('div');
        slideDescription.className = 'slide-description';
        const p = document.createElement('p');
        p.textContent = slideData.slideDescription;
        slideDescription.appendChild(p);

        const slideLink = document.createElement('div');
        slideLink.className = 'slide-link';
        const a = document.createElement('a');
        a.href = slideData.slideUrl;
        a.textContent = slideData.slideUrl;
        slideLink.appendChild(a);

        slideHeader.appendChild(slideTitle);
        slideHeader.appendChild(slideDescription);
        slideHeader.appendChild(slideLink);

        const slideInfo = document.createElement('div');
        slideInfo.className = 'slide-info';

        const slideTags = document.createElement('div');
        slideTags.className = 'slide-tags';
        const tagsLabel = document.createElement('p');
        tagsLabel.textContent = 'Tags';
        slideTags.appendChild(tagsLabel);

        slideData.slideTags.forEach(tag => {
            const tagP = document.createElement('p');
            tagP.textContent = tag;
            slideTags.appendChild(tagP);
        });

        const slideIndexWrapper = document.createElement('div');
        slideIndexWrapper.className = 'slide-index-wrapper';
        const slideIndexCopy = document.createElement('p');
        slideIndexCopy.textContent = slideIndex.toString().padStart(2, '0');
        const slideIndexSeparator = document.createElement('p');
        slideIndexSeparator.textContent = '/';
        const slidesTotalCount = document.createElement('p');
        slidesTotalCount.textContent = totalSlides.toString().padStart(2, '0');

        slideIndexWrapper.appendChild(slideIndexCopy);
        slideIndexWrapper.appendChild(slideIndexSeparator);
        slideIndexWrapper.appendChild(slidesTotalCount);

        slideInfo.appendChild(slideTags);
        slideInfo.appendChild(slideIndexWrapper);

        slide.appendChild(slideImg);
        slide.appendChild(slideHeader);
        slide.appendChild(slideInfo);

        return slide;
    }

    function splitText(slide) {
        const slideHeader = slide.querySelector('.slide-title h1');
        if (slideHeader) {
            const split = SplitText.create(slideHeader, {
                type: 'words',
                wordsClass: 'word',
                mask: 'words'
            });
        }


        const slideContent = slide.querySelectorAll("p, a");
        slideContent.forEach(element => {
            SplitText.create(element, {
                type: 'lines',
                linesClass: 'line',
                mask: 'lines',
                reduceWhiteSpace: false,
            });
        })
    }

    function animateSlide(direction) {
        if (isAnimating || !scrollAllowed) return;

        isAnimating = true;
        scrollAllowed = false;

        const slider = document.querySelector('.slider');
        const currentSlideElement = slider.querySelector('.slide');

        if (direction === "down") {
            currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
        } else {
            currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
        }

        const exitY = direction === "down" ? "-200vh" : "200vh";
        const entryY = direction === "down" ? "100vh" : "-100vh";
        const entryClipPath =
            direction === "down" ?
                "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)" :
                "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

        gsap.to(currentSlideElement, {
            scale: 0.25,
            opacity: 0,
            rotation: 30,
            y: exitY,
            duration: 1.25,
            ease: "power4.inOut",
            force3d: true,
            onComplete: () => {
                currentSlideElement.remove();
            }
        })

        setTimeout(() => {
            const newSlide = createSlide(currentSlide);

            gsap.set(newSlide, {
                y: entryY,
                clipPath: entryClipPath,
                force3d: true,
            })

            slider.appendChild(newSlide);

            splitText(newSlide);

            const words = newSlide.querySelectorAll(".word");
            const lines = newSlide.querySelectorAll(".line");

            gsap.set([...words, ...lines], {
                y: '100%',
                force3d: true,
            });

            gsap.to(newSlide, {
                y: 0,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.75,
                ease: "power4.inOut",
                force3d: true,
                onStart: () => {
                    const t1 = gsap.timeline();

                    const headerWords = newSlide.querySelectorAll(".slide-title .word");
                    t1.to(headerWords, {
                        y: 0,
                        duration: 0.75,
                        ease: "power4.out",
                        stagger: 0.1,
                        force3d: true,
                    }, 0.75);

                    const tagsLines = newSlide.querySelectorAll(".slide-tags .line");
                    const indexLines = newSlide.querySelectorAll(".slide-index-wrapper .line");
                    const descriptionLines = newSlide.querySelectorAll(".slide-description .line");

                    t1.to(tagsLines, {
                        y: 0,
                        duration: 0.75,
                        ease: "power4.out",
                        stagger: 0.1,
                    }, "-=0.75")

                    t1.to(indexLines, {
                        y: 0,
                        duration: 0.75,
                        ease: "power4.out",
                        stagger: 0.1,
                    }, "<")

                    t1.to(descriptionLines, {
                        y: 0,
                        duration: 0.75,
                        ease: "power4.out",
                        stagger: 0.1,
                    }, "<")

                    const linkLines = newSlide.querySelectorAll(".slide-link .line");
                    t1.to(linkLines, {
                        y: 0,
                        duration: 0.75,
                        ease: "power4.out",
                        stagger: 0.1,
                        // force3d: true,
                    }, "-=1");
                },
                onComplete: () => {
                    isAnimating = false;
                    setTimeout(() => {
                        scrollAllowed = true;
                        lastScrollTime = Date.now();
                    }, 100);
                }
            });
        }, 750);
    }

    function handleScroll(direction) {
        const now = Date.now();

        if (isAnimating || !scrollAllowed) return;
        if (now - lastScrollTime < 1000) return;

        lastScrollTime = now;
        animateSlide(direction);
    }

    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY > 0) {
            handleScroll("down");
        } else {
            handleScroll("up");
        }
    }, { passive: false });

    let touchStartY = 0;
    let isTouchActive = false;

    window.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
        isTouchActive = true;
    }, { passive: false });

    window.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (!isTouchActive || isAnimating || !scrollAllowed) return;

        const touchCurrentY = event.touches[0].clientY;
        const difference = touchStartY - touchCurrentY;

        if (Math.abs(difference) > 50) {
            isTouchActive = false;
            if (difference > 0) {
                handleScroll("down");
            } else {
                handleScroll("up");
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isTouchActive = false;
    }, { passive: false });
});