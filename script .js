
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger');
            const navLinks = document.querySelector('.nav-links');
            const dropdowns = document.querySelectorAll('.dropdown');

            hamburger.addEventListener('click', function() {
                this.classList.toggle('open');
                navLinks.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        hamburger.classList.remove('open');
                        navLinks.classList.remove('active');
                    }
                });
            });

            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('.nav-link');
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        const content = this.nextElementSibling;
                        content.style.display = content.style.display === 'block' ? 'none' : 'block';
                    }
                });
            });

            document.addEventListener('click', function(e) {
                if (window.innerWidth > 768) return;
                
                dropdowns.forEach(dropdown => {
                    const content = dropdown.querySelector('.dropdown-content');
                    if (!dropdown.contains(e.target) && content.style.display === 'block') {
                        content.style.display = 'none';
                    }
                });
            });
        });
       