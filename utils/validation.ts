import { ValidationErrors } from '../types';

// Validation utility functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 1000); // Limit length
};

export const validateQuizTitle = (title: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedTitle = sanitizeInput(title);
  
  if (!sanitizedTitle || sanitizedTitle.length === 0) {
    errors.push({ field: 'title', message: 'Quiz title is required' });
  } else if (sanitizedTitle.length < 3) {
    errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters' });
  } else if (sanitizedTitle.length > 100) {
    errors.push({ field: 'title', message: 'Quiz title must be less than 100 characters' });
  }
  
  return errors;
};

export const validateQuizDescription = (description: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedDescription = sanitizeInput(description);
  
  if (sanitizedDescription && sanitizedDescription.length > 500) {
    errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
  }
  
  return errors;
};

export const validateQuestionText = (text: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedText = sanitizeInput(text);
  
  if (!sanitizedText || sanitizedText.length === 0) {
    errors.push({ field: 'question', message: 'Question text is required' });
  } else if (sanitizedText.length < 5) {
    errors.push({ field: 'question', message: 'Question must be at least 5 characters' });
  } else if (sanitizedText.length > 200) {
    errors.push({ field: 'question', message: 'Question must be less than 200 characters' });
  }
  
  return errors;
};

export const validateAnswerText = (text: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedText = sanitizeInput(text);
  
  if (!sanitizedText || sanitizedText.length === 0) {
    errors.push({ field: 'answer', message: 'Answer text is required' });
  } else if (sanitizedText.length < 1) {
    errors.push({ field: 'answer', message: 'Answer must be at least 1 character' });
  } else if (sanitizedText.length > 100) {
    errors.push({ field: 'answer', message: 'Answer must be less than 100 characters' });
  }
  
  return errors;
};

export const validateOutcomeTitle = (title: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedTitle = sanitizeInput(title);
  
  if (!sanitizedTitle || sanitizedTitle.length === 0) {
    errors.push({ field: 'outcomeTitle', message: 'Outcome title is required' });
  } else if (sanitizedTitle.length < 2) {
    errors.push({ field: 'outcomeTitle', message: 'Outcome title must be at least 2 characters' });
  } else if (sanitizedTitle.length > 50) {
    errors.push({ field: 'outcomeTitle', message: 'Outcome title must be less than 50 characters' });
  }
  
  return errors;
};

export const validateOutcomeDescription = (description: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedDescription = sanitizeInput(description);
  
  if (!sanitizedDescription || sanitizedDescription.length === 0) {
    errors.push({ field: 'outcomeDescription', message: 'Outcome description is required' });
  } else if (sanitizedDescription.length < 5) {
    errors.push({ field: 'outcomeDescription', message: 'Outcome description must be at least 5 characters' });
  } else if (sanitizedDescription.length > 200) {
    errors.push({ field: 'outcomeDescription', message: 'Outcome description must be less than 200 characters' });
  }
  
  return errors;
};

export const validateEmail = (email: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedEmail = sanitizeInput(email.toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!sanitizedEmail || sanitizedEmail.length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!emailRegex.test(sanitizedEmail)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  return errors;
};

export const validateUsername = (username: string): ValidationErrors => {
  const errors: ValidationErrors = [];
  const sanitizedUsername = sanitizeInput(username);
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  
  if (!sanitizedUsername || sanitizedUsername.length === 0) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (!usernameRegex.test(sanitizedUsername)) {
    errors.push({ field: 'username', message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
  }
  
  return errors;
};

// Helper function to check if there are any validation errors
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return errors.length > 0;
};

// Helper function to get the first error message for a field
export const getFirstError = (errors: ValidationErrors, field: string): string | undefined => {
  const error = errors.find(e => e.field === field);
  return error?.message;
};