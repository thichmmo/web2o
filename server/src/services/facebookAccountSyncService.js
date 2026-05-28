const db = require('../models');
const facebookService = require('./facebookService');

const statusToString = (status) => {
  if (status === undefined || status === null || status === '') return null;
  return String(status);
};

const isUsableAdAccountStatus = (status) => {
  const value = statusToString(status);
  return value === null || value === '1' || value.toUpperCase() === 'ACTIVE';
};

const toRecordPayload = (account, userId, fbAccountId) => ({
  userId,
  fbAccountId,
  adAccountId: facebookService.normalizeAdAccountId(account.id || account.account_id),
  adAccountName: account.name || account.id || account.account_id,
  accountStatus: statusToString(account.account_status),
  currency: account.currency || null,
  timezoneName: account.timezone_name || null,
  isActive: isUsableAdAccountStatus(account.account_status),
});

const syncAdAccountsForFacebookAccount = async (fbAccount, userId) => {
  const adAccounts = await facebookService.getUserAdAccounts(fbAccount.accessToken);
  const activeIds = [];

  for (const account of adAccounts) {
    const payload = toRecordPayload(account, userId, fbAccount.id);
    activeIds.push(payload.adAccountId);

    const [record, created] = await db.FacebookAdAccount.findOrCreate({
      where: {
        userId,
        fbAccountId: fbAccount.id,
        adAccountId: payload.adAccountId,
      },
      defaults: payload,
    });

    if (!created) {
      await record.update(payload);
    }
  }

  if (activeIds.length > 0) {
    await db.FacebookAdAccount.update(
      { isActive: false },
      {
        where: {
          userId,
          fbAccountId: fbAccount.id,
          adAccountId: { [db.Sequelize.Op.notIn]: activeIds },
        },
      }
    );
  }

  return db.FacebookAdAccount.findAll({
    where: { userId, fbAccountId: fbAccount.id, isActive: true },
    attributes: ['id', 'adAccountId', 'adAccountName', 'accountStatus', 'currency', 'timezoneName', 'isActive', 'updatedAt'],
    order: [['adAccountName', 'ASC']],
  });
};

const findOwnedAdAccount = async (userId, fbAccount, adAccountId) => {
  const normalizedAdAccountId = facebookService.normalizeAdAccountId(adAccountId);
  if (!normalizedAdAccountId) return null;

  let adAccount = await db.FacebookAdAccount.findOne({
    where: {
      userId,
      fbAccountId: fbAccount.id,
      adAccountId: normalizedAdAccountId,
      isActive: true,
    },
  });

  if (adAccount && !isUsableAdAccountStatus(adAccount.accountStatus)) {
    await adAccount.update({ isActive: false });
    return null;
  }
  if (adAccount) return adAccount;

  await syncAdAccountsForFacebookAccount(fbAccount, userId);
  adAccount = await db.FacebookAdAccount.findOne({
    where: {
      userId,
      fbAccountId: fbAccount.id,
      adAccountId: normalizedAdAccountId,
      isActive: true,
    },
  });

  if (adAccount && !isUsableAdAccountStatus(adAccount.accountStatus)) {
    await adAccount.update({ isActive: false });
    return null;
  }

  return adAccount;
};

module.exports = {
  syncAdAccountsForFacebookAccount,
  findOwnedAdAccount,
  isUsableAdAccountStatus,
};
