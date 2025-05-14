export const createFormData = (values: Record<string, unknown>) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      if (value[0] instanceof File) {
        value.forEach((file) => formData.append(key, file));
        continue;
      }

      if (typeof value[0] === 'object') {
        formData.append(key, JSON.stringify(value));
        continue;
      }

      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      continue;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
};
