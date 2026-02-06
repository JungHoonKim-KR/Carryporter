/**
 * 미션 생성 데이터 검증
 */
export const validateMissionCreate = (data: {
  callLocationId: number | null;
}): { isValid: boolean; error: string | null } => {
  if (!data.callLocationId) {
    return { isValid: false, error: '정류장을 선택해주세요.' };
  }

  return { isValid: true, error: null };
};

/**
 * PIN 비밀번호 검증
 */
export const validatePin = (pin: string): { isValid: boolean; error: string | null } => {
  if (pin.length !== 4) {
    return { isValid: false, error: '4자리 비밀번호를 입력해주세요.' };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { isValid: false, error: '숫자만 입력 가능합니다.' };
  }

  return { isValid: true, error: null };
};

/**
 * 이메일 검증
 */
export const validateEmail = (email: string): { isValid: boolean; error: string | null } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, error: '이메일을 입력해주세요.' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식이 아닙니다.' };
  }

  return { isValid: true, error: null };
};

/**
 * 비밀번호 검증 (4자리 숫자)
 */
export const validatePassword = (password: string): { isValid: boolean; error: string | null } => {
  if (!password) {
    return { isValid: false, error: '비밀번호를 입력해주세요.' };
  }

  if (password.length !== 4) {
    return { isValid: false, error: '4자리 숫자를 입력해주세요.' };
  }

  if (!/^\d{4}$/.test(password)) {
    return { isValid: false, error: '숫자만 입력 가능합니다.' };
  }

  return { isValid: true, error: null };
};
