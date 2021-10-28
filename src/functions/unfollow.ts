/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';

const unfollow = async () => {
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
   * Open Followers Modal
   */
  const followersButtonSelector = `a[href="/${process.env.INSTAGRAM_USERNAME}/followers/"]`;
  await page.waitForSelector(followersButtonSelector);
  const followersButton = await page.$(followersButtonSelector);
  await followersButton.click();

  /**
   * Load all Followers
   */
  const followersBoxSelector = 'div[aria-label="Followers"]';
  await page.waitForSelector(followersBoxSelector);
  const followersBox = await page.$(followersBoxSelector);
  const boundingFollowersBox = await followersBox.boundingBox();
  await page.mouse.move(
    boundingFollowersBox.x + boundingFollowersBox.width / 2,
    boundingFollowersBox.y + boundingFollowersBox.height / 2
  );

  let scrollsQuantity = 100;

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
   * Save Followers in Array
   */
  const followersSelector = `${followersBoxSelector} a[href]`;
  await page.waitForSelector(followersSelector);
  const followers = await page.$$(followersSelector);
  let followersList = await Promise.all(
    followers.map((follower) =>
      page.evaluate((f: HTMLAnchorElement) => f.href, follower)
    )
  );

  followersList = [...new Set(followersList)];

  /**
   * Close Followers Modal
   */
  const followersCloseButtonSelector = 'svg[aria-label="Close"]';
  await page.waitForSelector(followersCloseButtonSelector);
  const followersCloseButton = await page.$(followersCloseButtonSelector);
  await followersCloseButton.click();

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

  scrollsQuantity = 100;

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
   * Create not Following Me Back List
   */
  const notFollowingMeBackList = followingList.filter(
    (f) => !followersList.includes(f)
  );

  /**
   * Unfollow all users from tot Following Me Back List
   */
  for (let i = 0; i < notFollowingMeBackList.length; i += 1) {
    const url = notFollowingMeBackList[i];

    const regex = new RegExp(process.env.INSTAGRAM_USERNAME, 'g');

    if (!url.match(regex)) {
      await page.goto(url);

      try {
        const unfollowButtonSelector = 'span[aria-label="Following"]';
        await page.waitForSelector(unfollowButtonSelector);
        const unfollowButton = await page.$(unfollowButtonSelector);
        await unfollowButton.click();

        const unfollowButtonModalSelector = 'div[role="dialog"] button';
        await page.waitForSelector(unfollowButtonModalSelector);
        const unfollowButtonModal = await page.$(unfollowButtonModalSelector);
        await unfollowButtonModal.click();

        await new Promise((resolve) => setTimeout(resolve, 30000));
      } catch {
        //
      }
    }
  }

  process.exit();
};

export default unfollow;
