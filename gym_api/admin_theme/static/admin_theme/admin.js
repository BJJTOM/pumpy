// 💪 Pumpy Admin Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('💪 Pumpy Admin Theme Loaded!');
  
  // 현재 페이지 사이드바 링크 활성화
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.background = 'rgba(102, 126, 234, 0.2)';
      link.style.color = '#ffffff';
      link.style.fontWeight = '700';
      link.style.borderLeft = '3px solid #667eea';
      link.style.paddingLeft = '9px';
    }
  });
  
  // 다크 모드 토글 애니메이션
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  prefersDark.addEventListener('change', (e) => {
    if (e.matches) {
      console.log('🌙 다크 모드 활성화');
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      console.log('☀️ 라이트 모드 활성화');
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
  });
  
  // 사이드바 스크롤 위치 저장
  const sidebar = document.querySelector('.pumpy-sidebar');
  if (sidebar) {
    const savedScrollPosition = localStorage.getItem('pumpySidebarScroll');
    if (savedScrollPosition) {
      sidebar.scrollTop = parseInt(savedScrollPosition);
    }
    
    sidebar.addEventListener('scroll', () => {
      localStorage.setItem('pumpySidebarScroll', sidebar.scrollTop);
    });
  }
  
  // 부드러운 스크롤
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // 테이블 행 호버 효과 강화
  const tableRows = document.querySelectorAll('#result_list tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.2s ease';
    });
  });
  
  // 로딩 표시
  document.body.classList.add('pumpy-admin-loaded');
});

// 페이지 이탈 시 확인 (폼 변경 감지)
let formChanged = false;
const forms = document.querySelectorAll('form');

forms.forEach(form => {
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      formChanged = true;
    });
  });
  
  form.addEventListener('submit', () => {
    formChanged = false;
  });
});

window.addEventListener('beforeunload', (e) => {
  if (formChanged) {
    e.preventDefault();
    e.returnValue = '변경사항이 저장되지 않았습니다. 페이지를 나가시겠습니까?';
  }
});

