const { Op } = require("sequelize");
const User = require("./model/User");

async function saveUserData(data) {
  const dataObject = await User.upsert(data, { where: { id: data.id } });
  return dataObject;
}

async function getCompleteUserData(email, phoneNumber) {
  const completeUserData = await User.findAll({
    where: {
      email,
      phoneNumber,
    },
  });
  return completeUserData;
}

async function getPartialUserData(email, phoneNumber) {
  if (!email) email = "dummy";
  if (!phoneNumber) phoneNumber = "-1";
  const partialUserData = await User.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
    order: [["createdAt", "ASC"]],
  });
  return partialUserData;
}

async function getUserIdsFromEmailAndPhone(email, phoneNumber) {
  if (!email) email = "dummy";
  if (!phoneNumber) phoneNumber = "-1";
  const ids = await User.findAll({
    attributes: ["id", "linkedId"],
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
  });
  return ids;
}

async function getUserIdsFromProvidedIds(ids) {
  const idsData = await User.findAll({
    attributes: ["id", "linkedId"],
    where: {
      [Op.or]: [{ id: ids }, { linkedId: ids }],
    },
  });
  return idsData;
}

async function getUserRecordsByIds(ids) {
  const userDataRecords = await User.findAll({
    where: {
      id: ids,
    },
    order: [["createdAt", "ASC"]],
  });
  return userDataRecords;
}

function getUniqueEmails(data) {
  const uniqueEmails = data.reduce((acc, curr) => {
    if (curr.email && !acc.includes(curr.email)) {
      acc.push(curr.email);
    }
    return acc;
  }, []);
  return uniqueEmails;
}

function getUniquePhoneNumbers(data) {
  const uniquePhoneNumbers = data.reduce((acc, curr) => {
    if (curr.phoneNumber && !acc.includes(curr.phoneNumber)) {
      acc.push(curr.phoneNumber);
    }
    return acc;
  }, []);
  return uniquePhoneNumbers;
}

async function generateResponse(email, phoneNumber) {
  const idsSet = new Set();
  const recordIds = await getUserIdsFromEmailAndPhone(
    email,
    phoneNumber
  );

  for (const record of recordIds) {
    idsSet.add(record.id);
    if (record.linkedId) {
      idsSet.add(record.linkedId);
    }
  }

  const linkedRecordIds = await getUserIdsFromProvidedIds([...idsSet]);

  for (const record of linkedRecordIds) {
    idsSet.add(record.id);
    if (record.linkedId) {
      idsSet.add(record.linkedId);
    }
  }

  let previousSize = -1;

  while (previousSize < idsSet.size) {
    previousSize = idsSet.size;
    const linkedRecordIds = await getUserIdsFromProvidedIds([
      ...idsSet,
    ]);

    for (const record of linkedRecordIds) {
      idsSet.add(record.id);
      if (record.linkedId) {
        idsSet.add(record.linkedId);
      }
    }
  }

  const userDataRecords = await getUserRecordsByIds([...idsSet]);

  const payload = {
    contact: {
      primaryContactId: userDataRecords[0].id,
      emails: getUniqueEmails(userDataRecords),
      phoneNumbers: getUniquePhoneNumbers(userDataRecords),
      secondaryContactIds: userDataRecords.slice(1).map((record) => record.id),
    },
  };

  return payload;
}

module.exports = {
  generateResponse,
  getUniqueEmails,
  getUniquePhoneNumbers,
  saveUserData,
  getCompleteUserData,
  getPartialUserData,
  getUserIdsFromEmailAndPhone,
  getUserIdsFromProvidedIds,
  getUserRecordsByIds,
};
