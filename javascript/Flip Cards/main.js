document.addEventListener('DOMContentLoaded', function() {
    let reducedMotion = false;
    let disableAllAnimations = false;
    let aspectRatio = 1.58;
    let cardUnflip = 'card--unflip';
    let cardFlipped = 'card--flipped';
    let animationDelay = 500;
    let cardInnerTransform = 'transition: transform 0.2s ease, box-shadow 0.2s ease;';

    const tiltAmount = 9;
    const shadowIntensity = 25;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        reducedMotion = true;
    }

    function checkDisableAllAnimations() {
        if (disableAllAnimations) {
            cardUnflip = 'card--instant-unflip';
            cardFlipped = 'card--instant-flip';
            animationDelay = 0;
            cardInnerTransform = 'transition: none;';
        } else {
            cardUnflip = 'card--unflip';
            cardFlipped = 'card--flipped';
            animationDelay = 500;
            cardInnerTransform = 'transition: transform 0.2s ease, box-shadow 0.2s ease;';
        }
    }

    function resetAllCards() {
        document.querySelectorAll('.card__inner').forEach(cardInner => {
            cardInner.classList.remove(cardUnflip, cardFlipped);
            const frontFace = cardInner.querySelector('.card__face--front');
            frontFace.style.transition = 'none';
            frontFace.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            frontFace.style.boxShadow = `0px 0px 20px rgba(0, 0, 0, 0.4)`;
            requestAnimationFrame(() => {
                frontFace.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            });
        });
    }

    checkDisableAllAnimations();

    const reducedMotionCheckbox = document.getElementById('reducedMotionCheckbox');
    const disableAnimationsCheckbox = document.getElementById('disableAnimationsCheckbox');

    if (reducedMotionCheckbox) {
        reducedMotionCheckbox.addEventListener('change', function () {
            resetAllCards();
            reducedMotion = this.checked;
            checkDisableAllAnimations();
        });
    }

    if (disableAnimationsCheckbox) {
        disableAnimationsCheckbox.addEventListener('change', function () {
            resetAllCards();
            disableAllAnimations = this.checked;
            checkDisableAllAnimations();
        });
    }

    const handleCardFlip = (cardInner) => {
        if (reducedMotion && !disableAllAnimations) {
            cardInner.classList.toggle('is-flipped');
            return;
        }

        cardInner.style = cardInnerTransform;

        if (cardInner.classList.contains(cardUnflip)) {
            cardInner.classList.add(cardFlipped);
            setTimeout(() => {
                cardInner.classList.remove(cardUnflip, cardFlipped);
                const frontFace = cardInner.querySelector('.card__face--front');
                frontFace.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
                frontFace.style.boxShadow = `0px 0px 20px rgba(0, 0, 0, 0.4)`;
            }, animationDelay);
        } else {
            cardInner.classList.add(cardUnflip);
            const frontFace = cardInner.querySelector('.card__face--front');
            frontFace.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            frontFace.style.boxShadow = `0px 0px 20px rgba(0, 0, 0, 0.4)`;
        }
    };

    const handleMouseMove = (e, cardInner, frontFace, lightOverlay) => {
        if (reducedMotion || disableAllAnimations) return;

        const wrapperRect = cardInner.getBoundingClientRect();
        const cardRect = frontFace.getBoundingClientRect();
        const mouseX = e.clientX - wrapperRect.left;
        const mouseY = e.clientY - wrapperRect.top;
        const centerX = cardRect.width / 2;
        const centerY = cardRect.height / 2;
        const deltaX = (mouseX - centerX) / centerX;
        const deltaY = (mouseY - centerY) / centerY;
        const rotateX = deltaY * -tiltAmount;
        const rotateY = deltaX * tiltAmount;
        const lightX = centerX - (deltaX * centerX);
        const lightY = centerY - (deltaY * centerY);

        frontFace.style.transition = 'transform 0.05s ease, box-shadow 0.05s ease';
        frontFace.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        frontFace.style.boxShadow = `${-deltaX * shadowIntensity}px ${-deltaY * shadowIntensity}px 20px rgba(0, 0, 0, 0.6)`;
        lightOverlay.style.backgroundImage = `radial-gradient(circle at ${lightX}px ${lightY}px, rgba(230, 230, 255, 0.35), rgba(255, 255, 255, 0))`;
    };

    const handleMouseLeave = (frontFace, lightOverlay) => {
        if (reducedMotion || disableAllAnimations) return;

        frontFace.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
        frontFace.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        frontFace.style.boxShadow = `0px 0px 20px rgba(0, 0, 0, 0.6)`;
        lightOverlay.style.backgroundImage = ``;
    };

    document.querySelectorAll('.card__inner').forEach(cardInner => {
        const frontFace = cardInner.querySelector('.card__face--front');
        const lightOverlay = cardInner.querySelector('.light-overlay');

        cardInner.addEventListener('click', () => handleCardFlip(cardInner));
        cardInner.addEventListener('mousemove', (e) => {
            if (!cardInner.classList.contains(cardUnflip)) {
                handleMouseMove(e, cardInner, frontFace, lightOverlay);
            }
        });
        cardInner.addEventListener('mouseleave', () => {
            if (!cardInner.classList.contains(cardUnflip)) {
                handleMouseLeave(frontFace, lightOverlay);
            }
        });
    });

    // Handle card size slider
    const cardSizeSlider = document.getElementById('cardSizeSlider');
    if (cardSizeSlider) {
        cardSizeSlider.addEventListener('input', (e) => {
            const newSize = e.target.value;
            const viewportWidth = window.innerWidth;
            const sizeInVw = (newSize / viewportWidth) * 100;
            const newFontSizeHeader = sizeInVw * 0.14;
            const newFontSizeBody = sizeInVw * 0.1;

            document.querySelectorAll('.card').forEach(card => {
                card.style.width = `${sizeInVw}vw`;
                card.style.height = `${sizeInVw * aspectRatio}vw`;
            });

            document.querySelectorAll('.card__face').forEach(face => {
                face.style.padding = `${sizeInVw * 0.027}vw`;
            });
        });
    }

    // Handle aspect ratio slider
    const aspectRatioSlider = document.getElementById('aspectRatioSlider');
    if (aspectRatioSlider) {
        aspectRatioSlider.addEventListener('input', (e) => {
            aspectRatio = e.target.value / 100;
            document.querySelectorAll('.card').forEach(card => {
                const width = parseFloat(card.style.width);
                card.style.height = `${width * aspectRatio}vw`;
            });
        });
    }
});
