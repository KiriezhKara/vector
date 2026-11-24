document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vacancyForm');
  if (!form) return;

  const showError = (field, message) => {
    field.classList.add('form__input--error');
    let errorEl = field.parentElement.querySelector('.form__error');

    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form__error';
      field.insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
  };

  const clearError = (field) => {
    field.classList.remove('form__input--error');
    const errorEl = field.parentElement.querySelector('.form__error');
    if (errorEl) {
      errorEl.remove();
    }
  };

  const clearSuccess = () => {
    const successEl = form.querySelector('.form__success');
    if (successEl) successEl.remove();
  };

  const showSuccess = (message) => {
    clearSuccess();
    const successEl = document.createElement('div');
    successEl.className = 'form__success';
    successEl.setAttribute('role', 'status');
    successEl.textContent = message;
    form.appendChild(successEl);
  };

  const validators = {
    jobTitle: (value) => {
      if (!value.trim()) return 'Укажите название должности';
      if (value.trim().length < 3) return 'Слишком короткое название (мин. 3 символа)';
      return null;
    },
    companyName: (value) => {
      if (!value.trim()) return 'Укажите название организации';
      if (value.trim().length < 2) return 'Слишком короткое название (мин. 2 символа)';
      return null;
    },
    salary: (value) => {
      if (!value.trim()) return null;
      const cleanValue = value.replace(/\s/g, '');
      const salaryPattern = /^(от)?\d{1,6}([-–]\d{1,6})?$/i;
      if (!salaryPattern.test(cleanValue)) {
        return 'Введите корректную сумму цифрами (например: 1500, от 1500 или 1000-2000)';
      }
      return null;
    },
    jobDesc: (value) => {
      if (!value.trim()) return 'Добавьте описание вакансии';
      if (value.trim().length < 30) return 'Описание слишком короткое (минимум 30 символов)';
      return null;
    },
    contactEmail: (value) => {
      if (!value.trim()) return 'Укажите email';
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value.trim())) {
        return 'Введите корректный email, например: hr@company.by';
      }
      return null;
    },
    contactPhone: (value) => {
      if (!value.trim()) return null;
      let phoneClean = value.replace(/[\s\-()]/g, '');
      if (phoneClean.startsWith('+375') || phoneClean.startsWith('80') || phoneClean.startsWith('375')) {
        if (phoneClean.startsWith('80')) phoneClean = '+375' + phoneClean.substring(2);
        if (phoneClean.startsWith('375')) phoneClean = '+' + phoneClean;
        const byPattern = /^\+375(25|29|33|44)\d{7}$/;
        if (!byPattern.test(phoneClean)) {
          return 'Некорректный номер РБ. Формат: +375 (25/29/33/44) XXX-XX-XX';
        }
        return null;
      }
      if (phoneClean.startsWith('+7') || phoneClean.startsWith('8')) {
        if (phoneClean.startsWith('8')) phoneClean = '+7' + phoneClean.substring(1);
        if (phoneClean.startsWith('7')) phoneClean = '+' + phoneClean;
        const ruGeneralPattern = /^\+7\d{10}$/;
        if (ruGeneralPattern.test(phoneClean)) {
          return null;
        }
        return 'Некорректный номер РФ. Формат: +7 (9XX) XXX-XX-XX';
      }
      return 'Введите номер с кодом страны: +375 (Беларусь) или +7 (Россия)';
    }
  };

  const fields = form.querySelectorAll('.form__input, .form__textarea, .form__select');

  fields.forEach((field) => {
    const fieldName = field.name;
    field.addEventListener('input', () => {
      clearError(field);
      clearSuccess();
    });
    field.addEventListener('blur', () => {
      if (validators[fieldName]) {
        const errorMessage = validators[fieldName](field.value);
        if (errorMessage) {
          showError(field, errorMessage);
        } else {
          clearError(field);
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    clearSuccess();

    fields.forEach((field) => {
      const fieldName = field.name;
      if (validators[fieldName]) {
        const errorMessage = validators[fieldName](field.value);
        if (errorMessage) {
          showError(field, errorMessage);
          isValid = false;
        } else {
          clearError(field);
        }
      }
    });

    if (isValid) {
      form.reset();
      form.querySelectorAll('.form__error').forEach((el) => el.remove());
      form.querySelectorAll('.form__input--error').forEach((el) => el.classList.remove('form__input--error'));
      showSuccess('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
    } else {
      const firstError = form.querySelector('.form__error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
});