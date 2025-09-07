export function formatError(error) {
  return {
    message: error.message || 'An error occurred.',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}
