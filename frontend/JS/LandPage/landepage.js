document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.box');
    const stage = document.querySelector('.stage');
    const prevArrow = document.getElementById('arrow-prev');
    const nextArrow = document.getElementById('arrow-next');
    const totalSteps = steps.length;
    let currentIndex = 0;

    // Função central para atualizar a visualização
    function updateView() {
        // Lógica para o slider em telas mobile
        if (window.innerWidth <= 768) {
            const offset = -currentIndex * 100;
            stage.style.transform = `translateX(${offset}%)`;
        }
        
        // Lógica para destacar o card ativo (desktop)
        steps.forEach((step, index) => {
            if (index === currentIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Habilita/desabilita as setas
        prevArrow.disabled = currentIndex === 0;
        nextArrow.disabled = currentIndex === totalSteps - 1;
    }

    // Navegação pela seta "próximo"
    nextArrow.addEventListener('click', () => {
        if (currentIndex < totalSteps - 1) {
            currentIndex++;
            updateView();
        }
    });

    // Navegação pela seta "anterior"
    prevArrow.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateView();
        }
    });

    // Permite clicar nos cards para navegar (apenas em telas maiores)
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            if (window.innerWidth > 768) {
                currentIndex = index;
                updateView();
            }
        });
    });

    // Garante que o layout se ajuste ao redimensionar a janela
    window.addEventListener('resize', () => {
        // Reseta a transformação se sair do modo mobile para evitar bugs
        if (window.innerWidth > 768) {
            stage.style.transform = `translateX(0%)`;
        }
        updateView(); // Re-avalia a view no resize
    });

    // Inicia a visualização
    updateView();
});

 const menuToggle = document.getElementById('menu-toggle');
    const menuResponsivo = document.getElementById('menu_responsivo');

    menuToggle.addEventListener('click', () => {
      menuResponsivo.classList.toggle('active');
      menuToggle.classList.toggle('open');
    });