import { json, redirect } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { isValidTheme, userTheme } from '~/lib/theme';

export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get('theme');

  if (!isValidTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme} is not a valid theme`,
    });
  }

  return json({ success: true }, { headers: { 'Set-Cookie': await userTheme.serialize(theme) } });
};
