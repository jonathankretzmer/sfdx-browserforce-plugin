import type { Page } from 'puppeteer';
import type { Connection } from '@salesforce/core';

const ERROR_DIV_SELECTOR = '#error';
const PATH = 'secur/frontdoor.jsp';
const POST_LOGIN_PATH = 'setup/forcecomHomepage.apexp';

export class LoginPage {
  private page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(conn: Connection) {
    await this.page.goto(
      `${conn.instanceUrl}/${PATH}?sid=${
        conn.accessToken
      }&retURL=${encodeURIComponent(POST_LOGIN_PATH)}`
    );
    await this.throwPageErrors();
    return this;
  }

  async throwPageErrors(): Promise<void> {
    const errorHandle = await this.page.$(ERROR_DIV_SELECTOR);
    if (errorHandle) {
      const errorMessage = (
        await this.page.evaluate(
          (div: HTMLDivElement) => div.innerText,
          errorHandle
        )
      )?.trim();
      await errorHandle.dispose();
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    }
  }
}
