const { Op } = require("sequelize");
const {
  generateResponse,
  getCompleteUserData,
  getPartialUserData,
  saveUserData,
} = require("./helper");

async function identify(email, phoneNumber) {
  console.log(email, phoneNumber);
  try {
    // Check if the complete record exists in the database
    const completeRecord = await getCompleteUserData(email, phoneNumber);
    if (completeRecord.length > 0) {
      return generateResponse(email, phoneNumber);
    }

    // Check if partial record exists in the database
    const partialRecord = await getPartialUserData(email, phoneNumber);

    if (partialRecord.length === 0) {
      // If no record found, insert a new primary record
      const record = {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      };
      await saveUserData(record);
      return generateResponse(email, phoneNumber);
    }

    if (!email || !phoneNumber) {
      // If email or phoneNumber is missing, return the response with available data
      return generateResponse(email, phoneNumber);
    }

    // Process the records and check for matching email and phoneNumber
    const records = partialRecord.map((record) => ({
      id: record.id,
      phoneNumber: record.phoneNumber,
      email: record.email,
      linkedId: record.linkedId,
      linkPrecedence: record.linkPrecedence,
    }));

    let isEmailFound = false;
    let isPhoneFound = false;
    const linkId = records[0].id;

    if (records[0].email && records[0].email === email) isEmailFound = true;
    if (records[0].phoneNumber && records[0].phoneNumber === phoneNumber)
      isPhoneFound = true;

    for (const record of records.slice(1)) {
      if (record.linkPrecedence !== "secondary") {
        const rowData = {
          id: record.id,
          email: record.email,
          phoneNumber: record.phoneNumber,
          linkPrecedence: "secondary",
          linkedId: linkId,
        };
        await saveUserData(rowData);
      }

      // Check for matching email and phoneNumber
      if (!isEmailFound) {
        if (record.email === email) {
          isEmailFound = true;
        }
      }
      if (!isPhoneFound) {
        if (record.phoneNumber === phoneNumber) {
          isPhoneFound = true;
        }
      }
    }

    if (!isEmailFound || !isPhoneFound) {
      // If matching email or phoneNumber not found, insert a new secondary record
      const rowData = {
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: linkId,
      };
      await saveUserData(rowData);
    }

    return generateResponse(email, phoneNumber);
  } catch (err) {
    console.error("Error identifying user:", err);
    return "Error identifying user:", err;
  }
}

module.exports = { identify };
