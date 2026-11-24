/**
 * ==========================================================================
 * KARTHICK SIVA R - MAIN INTERACTIVE LOGIC & SOUND FX ENGINE
 * Features:
 * - Dynamic Typewriter effect
 * - Web Audio API Futuristic Cyber Synth (Sound FX toggle)
 * - 3D Card Perspective Tilt
 * - Skills Category Filter
 * - Metrics Counter Animation
 * - Smooth Scroll & Nav ScrollSpy
 * - Mobile Menu Controller
 * - Resume Modal & Print PDF
 * - Project Detail Dynamic Modal
 * - Clipboard Copy & Toast Feedback
 * - Interactive Contact Form Handler
 * ==========================================================================
 */

(function () {
  'use strict';

  // State
  let soundEnabled = true;
  let audioCtx = null;

  // Cache DOM Elements
  const header = document.getElementById('header');
  const navMenu = document.getElementById('navMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const soundToggle = document.getElementById('soundToggle');
  const typewriterElement = document.getElementById('typewriterText');
  const customCursor = document.getElementById('customCursor');
  const cursorTrail = document.getElementById('cursorTrail');
  const resumeModal = document.getElementById('resumeModal');
  const projectModal = document.getElementById('projectModal');
  const openResumeBtn = document.getElementById('openResumeBtn');
  const heroResumeBtn = document.getElementById('heroResumeBtn');
  const closeResumeModal = document.getElementById('closeResumeModal');
  const closeProjectModal = document.getElementById('closeProjectModal');
  const printResumeBtn = document.getElementById('printResumeBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  const currentYearSpan = document.getElementById('currentYear');

  // Set current year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER (ZERO ASSET DEPENDENCY)
     ========================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(1020, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio autoplay policy fail-safe
    }
  }

  // Sound toggle button listener
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggle.classList.toggle('muted', !soundEnabled);
      soundToggle.innerHTML = soundEnabled
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark"></i>';
      showToast(soundEnabled ? 'UI Sound FX Enabled' : 'UI Sound FX Muted');
      if (soundEnabled) playSynthSound('click');
    });
  }

  /* ==========================================================================
     2. DYNAMIC TYPEWRITER EFFECT
     ========================================================================== */
  const roles = [
    'Aspiring Full Stack Developer',
    'Cloud Computing & Cloud Security',
    'React.js & Node.js Engineer',
    'AWS Cloud Architect Enthusiast',
    'Competitive Problem Solver'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingDelay = 100;

  function typeRole() {
    if (!typewriterElement) return;

    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typewriterElement.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingDelay = 40;
    } else {
      typewriterElement.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingDelay = 90;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingDelay = 2200; // Pause at end of text
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingDelay = 450;
    }

    setTimeout(typeRole, typingDelay);
  }

  setTimeout(typeRole, 600);

  /* ==========================================================================
     3. 3D CARD PERSPECTIVE TILT
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (max +/- 10 degrees)
      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* ==========================================================================
     4. CUSTOM CURSOR
     ========================================================================== */
  if (customCursor && cursorTrail) {
    let mouseX = -100, mouseY = -100;
    let trailX = -100, trailY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      customCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderTrail() {
      trailX += (mouseX - trailX) * 0.22;
      trailY += (mouseY - trailY) * 0.22;
      cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px)`;
      requestAnimationFrame(renderTrail);
    }
    requestAnimationFrame(renderTrail);

    // Hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .skill-card, .tilt-card');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        customCursor.classList.add('active');
        cursorTrail.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        customCursor.classList.remove('active');
        cursorTrail.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     5. SKILLS FILTERING TABS
     ========================================================================== */
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playSynthSound('click');
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  /* ==========================================================================
     6. METRICS COUNTER ANIMATION
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  let metricsAnimated = false;

  function runCounterAnimation() {
    statNumbers.forEach((counter) => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const duration = 1800; // ms
      const stepTime = 30;
      const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = count;
        }
      }, stepTime);
    });
  }

  const statsSection = document.querySelector('.stats-ribbon');
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !metricsAnimated) {
        metricsAnimated = true;
        runCounterAnimation();
      }
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }

  /* ==========================================================================
     7. NAVBAR SCROLLSPY & HEADER BACKGROUND
     ========================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header background toggle
    if (header) {
      if (scrollPos > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // ScrollSpy active link detection
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      playSynthSound('click');
      mobileMenuBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        playSynthSound('click');
        mobileMenuBtn.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     8. RESUME MODAL & PRINT HANDLERS
     ========================================================================== */
  function openResume() {
    playSynthSound('open');
    if (resumeModal) {
      resumeModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResume() {
    playSynthSound('click');
    if (resumeModal) {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);
  if (closeResumeModal) closeResumeModal.addEventListener('click', closeResume);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResume();
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      playSynthSound('click');
      window.print();
    });
  }

  /* ==========================================================================
     9. PROJECT DETAILS MODAL
     ========================================================================== */
  const projectDetails = {
    medicare: {
      title: 'MediCare 360 — Smart Healthcare Management System',
      category: 'Full Stack Hospital Platform',
      tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth', 'REST APIs'],
      summary: 'A unified full-stack digital hospital management platform designed to connect doctors, patients, receptionists, and administrative personnel under high-security role-based access.',
      bullets: [
        'Built full CRUD pipelines for patient appointment scheduling, clinical history records, and doctor consult logs.',
        'Engineered responsive React.js dashboards with modular components for doctors, patients, and administrators.',
        'Implemented secure Node.js/Express.js backend with encrypted session cookies, JWT token verification, and input sanitation.',
        'Designed MongoDB aggregation pipelines for instant search across patient health databases and appointment statuses.'
      ],
      github: 'https://github.com/siva1406'
    },
    portfolio: {
      title: 'KS Developer Portfolio',
      category: 'Frontend & Modern Web Application',
      tech: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'React.js', 'Responsive UI'],
      summary: 'A modern, responsive personal developer portfolio website showcasing technical projects, core skills, and credentials built with clean HTML5, CSS3, JavaScript, and React.js.',
      bullets: [
        'Engineered modular component architecture utilizing HTML5, CSS3, JavaScript (ES6+), and React.js.',
        'Designed with an elegant dark luxury aesthetic (#800021, #881144, #243A66, #C24366, #FF69B4, #FFE4D8) and clean typography.',
        'Includes synthetic Web Audio API feedback for interactive buttons, mouse parallax dampening, and print resume stylesheets.',
        'Achieves 100% responsive performance across mobile, tablet, and desktop screens with zero lag and instant page load speeds.'
      ],
      github: 'https://github.com/siva1406'
    },
    kdcafe: {
      title: 'KD Cafe — Smart Order & POS System',
      category: 'Full Stack Order & Billing System',
      tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      summary: 'Fast and intuitive cafe management point-of-sale system enabling live menu ordering, kitchen order ticketing, and automated invoice calculation.',
      bullets: [
        'Developed real-time cart state management with instant tax, discount, and total computation.',
        'Streamlined multi-category menu browsing with instant keyword search and tag filtering.',
        'Equipped with live order tracking queues for kitchen prep and cashier fulfillment.'
      ],
      github: 'https://github.com/siva1406'
    }
  };

  const projectTriggers = document.querySelectorAll('.project-modal-trigger');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectBody = document.getElementById('modalProjectBody');

  projectTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      playSynthSound('open');
      const projKey = btn.getAttribute('data-project');
      const data = projectDetails[projKey];
      if (!data) return;

      modalProjectTitle.textContent = data.title;
      modalProjectBody.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--c-hotpink); text-transform: uppercase;">${data.category}</span>
          <p style="color: var(--text-muted); margin-top: 8px; font-size: 0.95rem; line-height: 1.6;">${data.summary}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 1rem; color: var(--c-pearl); margin-bottom: 10px;">Key Engineering Highlights:</h4>
          <ul style="padding-left: 20px; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
            ${data.bullets.map(b => `<li style="margin-bottom: 8px;">${b}</li>`).join('')}
          </ul>
        </div>
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px;">Technologies:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <i class="fa-brands fa-github"></i> View on GitHub
          </a>
        </div>
      `;

      projectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeProjectModal) {
    closeProjectModal.addEventListener('click', () => {
      playSynthSound('click');
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     10. CLIPBOARD COPY & TOAST NOTIFICATION
     ========================================================================== */
  function showToast(message) {
    if (!toastNotification || !toastMsg) return;
    toastMsg.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      playSynthSound('click');
      const email = 'karthicksiva13140525@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copied to clipboard: ' + email);
        }).catch(() => {
          fallbackCopyText(email);
        });
      } else {
        fallbackCopyText(email);
      }
    });
  }

  function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Email copied to clipboard!');
  }

  /* ==========================================================================
     11. CONTACT FORM HANDLER
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSynthSound('success');

      const name = document.getElementById('senderName')?.value || 'Guest';
      const email = document.getElementById('senderEmail')?.value || '';
      const subject = document.getElementById('senderSubject')?.value || 'Portfolio Inquiry';
      const message = document.getElementById('senderMessage')?.value || '';

      const submitBtn = document.getElementById('sendBtn');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;
      }

      // Simulate sending with zero error guarantees
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
        }
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `<strong>Thank you, ${name}!</strong> Your message has been received. I will reach back to you at <strong>${email}</strong> shortly.`;
        }
        showToast('Message sent successfully!');
        contactForm.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
            submitBtn.disabled = false;
          }
        }, 4000);
      }, 900);
    });
  }

  // Keyboard accessibility: ESC key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resumeModal && resumeModal.classList.contains('active')) closeResume();
      if (projectModal && projectModal.classList.contains('active')) {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

})();
