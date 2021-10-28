/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';

const like = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto('https://instagram.com');

  /**
   * Click in login with facebook button
   */
  const loginWithFacebookButtonSelector = 'button[type="button"]';
  await page.waitForSelector(loginWithFacebookButtonSelector);
  const loginWithFacebookButton = await page.$(loginWithFacebookButtonSelector);
  await loginWithFacebookButton.click();

  /**
   * Login
   */
  const emailInputSelector = '#email';
  await page.waitForSelector(emailInputSelector);
  const emailInput = await page.$(emailInputSelector);
  await emailInput.type(process.env.INSTAGRAM_EMAIL);

  const passwordInputSelector = '#pass';
  await page.waitForSelector(passwordInputSelector);
  const passwordInput = await page.$(passwordInputSelector);
  await passwordInput.type(process.env.INSTAGRAM_PASSWORD);

  const loginButtonSelector = 'button[type="submit"]';
  await page.waitForSelector(loginButtonSelector);
  const loginButton = await page.$(loginButtonSelector);
  await loginButton.click();

  /**
   * Click in Not now button to decline notifications
   */
  try {
    const notNowButtonSelector = 'button.aOOlW.HoLwm';
    await page.waitForSelector(notNowButtonSelector);
    const notNowButton = await page.$(notNowButtonSelector);
    await notNowButton.click();
  } catch {
    //
  }

  /**
   * Go to Profile
   */
  const profilePictureSelector = 'img[data-testid="user-avatar"]';
  await page.waitForSelector(profilePictureSelector);
  const profilePicture = await page.$(profilePictureSelector);
  await profilePicture.click();

  const profileOptionSelector = `a[href="/${process.env.INSTAGRAM_USERNAME}/"]`;
  await page.waitForSelector(profileOptionSelector);
  const profileOption = await page.$(profileOptionSelector);
  await profileOption.click();

  /**
   * Open Following Modal
   */
  const followingButtonSelector = `a[href="/${process.env.INSTAGRAM_USERNAME}/following/"]`;
  await page.waitForSelector(followingButtonSelector);
  const followingButton = await page.$(followingButtonSelector);
  await followingButton.click();

  /**
   * Load all Following
   */
  const followingBoxSelector = 'div[aria-label="Following"]';
  await page.waitForSelector(followingBoxSelector);
  const followingBox = await page.$(followingBoxSelector);
  const boundingFollowingBox = await followingBox.boundingBox();
  await page.mouse.move(
    boundingFollowingBox.x + boundingFollowingBox.width / 2,
    boundingFollowingBox.y + boundingFollowingBox.height / 2
  );

  let scrollsQuantity = 50;

  while (scrollsQuantity) {
    await page.mouse.wheel({ deltaY: 1000 });

    if (scrollsQuantity) {
      scrollsQuantity -= 1;
    } else {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Save Following in Array
   */
  const followingSelector = `${followingBoxSelector} a[href]`;
  await page.waitForSelector(followingSelector);
  const following = await page.$$(followingSelector);
  let followingList = await Promise.all(
    following.map((follower) =>
      page.evaluate((f: HTMLAnchorElement) => f.href, follower)
    )
  );

  followingList = [...new Set(followingList)];

  /**
   * Close Followers Modal
   */
  const followersCloseButtonSelector = 'svg[aria-label="Close"]';
  await page.waitForSelector(followersCloseButtonSelector);
  const followersCloseButton = await page.$(followersCloseButtonSelector);
  await followersCloseButton.click();

  for (let i = 0; i < followingList.length; i += 1) {
    const url = followingList[i];

    const regex = new RegExp(process.env.INSTAGRAM_USERNAME, 'g');

    if (!url.match(regex)) {
      await page.goto(url);

      try {
        const lastPostSelector = 'article a';
        await page.waitForSelector(lastPostSelector);
        const lastPost = await page.$(lastPostSelector);
        await lastPost.click();

        let tries = 5;

        while (tries) {
          await page.waitForTimeout(2000);

          const likeButtonSelector = '.ltpMr.Slqrh .wpO6b';

          const likeSvgSelector = `${likeButtonSelector} svg[aria-label="Like"]`;
          const likeSvg = await page.$(likeSvgSelector);

          if (likeSvg) {
            const likeButton = await page.$(likeButtonSelector);
            await likeButton.click();

            await page.waitForTimeout(2000);

            break;
          }

          tries -= 1;
        }

        await page.waitForTimeout(2000);
      } catch {
        //
      }
    }
  }

  process.exit();
};

export default like;
