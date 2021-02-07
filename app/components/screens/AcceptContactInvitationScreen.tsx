import React from "react";
import { Alert } from "react-native";
import { TextInput } from "react-native-paper";
import { useClient } from "urql";
import useDevice from "../../hooks/useDevice";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import useUser from "../../hooks/useUser";
import {
  generateSigningPublicKey,
  signContactUserKey,
} from "../../utils/signing";
import * as privateInfoStore from "../../utils/privateInfoStore";
import { Y } from "../../vendor/index.js";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import acceptContactInvitation from "../../utils/server/acceptContactInvitation";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import Button from "../ui/Button";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import * as contactInvitationIdentification from "../../utils/contactInvitationIdentification";

export default function AcceptContactInvitationScreen({ navigation }) {
  const [processStep, setProcessStep] = React.useState<
    "default" | "addingContact"
  >("default");
  const deviceResult = useDevice();
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [invitationCode, setInvitationCode] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const client = useClient();

  if (
    deviceResult.type !== "device" ||
    userResult.type !== "user" ||
    privateUserSigningKeyResult.type !== "privateUserSigningKey"
  )
    return null;

  const acceptContactInvitationStep = async () => {
    setProcessStep("addingContact");

    try {
      const invitation: contactInvitationIdentification.ContactInviation = contactInvitationIdentification.parse(
        invitationCode
      );

      const signature = signContactUserKey(
        privateUserSigningKeyResult.privateUserSigningKey,
        invitation.userSigningKey
      );
      const userSigningKey = generateSigningPublicKey(
        privateUserSigningKeyResult.privateUserSigningKey
      );

      await acceptContactInvitation({
        inviterUserId: invitation.userId,
        inviterUserSigningKey: invitation.userSigningKey,
        clientSecret: invitation.clientSecret,
        serverSecret: invitation.serverSecret,
        userId: userResult.user.id,
        client,
        device: deviceResult.device,
        signature,
        userSigningKey,
      });

      const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
      const yContacts = privateInfoYDoc.getMap("contacts");
      const contact = yContacts.get(invitation.userId);
      const newContact = contact ? contact : new Y.Map();
      newContact.set("name", contactName);
      newContact.set("userSigningKey", invitation.userSigningKey);
      yContacts.set(invitation.userId, newContact);
      const verifiedDevices = await fetchMyVerifiedDevices();
      await updatePrivateInfo(
        privateInfoYDoc,
        client,
        deviceResult.device,
        verifiedDevices
      );
      await privateInfoStore.setPrivateInfo(privateInfoYDoc);
      setProcessStep("default");
      Alert.alert(`Successfully added ${contactName} as your contact.`);
      navigation.navigate("ContactsList");
    } catch (err) {
      setProcessStep("default");
      Alert.alert("Failed to accept the invitation.", `Error: ${err.message}`);
    }
  };

  return (
    <ScrollScreenContainer horizontalPadding>
      <Spacer />
      <Text>
        {`Please paste the received "Invitation Code" into the first text input.`}
      </Text>
      <Spacer />
      <TextInput
        mode="outlined"
        label="Contact Identification"
        value={invitationCode}
        onChangeText={(value) => setInvitationCode(value)}
        multiline
        disabled={processStep !== "default"}
        style={{ backgroundColor: "#fff" }}
      />
      <Spacer />
      <TextInput
        mode="outlined"
        label="Contact's Name"
        value={contactName}
        onChangeText={(value) => setContactName(value)}
        disabled={processStep !== "default"}
        style={{ backgroundColor: "#fff" }}
      />
      <Spacer />
      <Button
        onPress={acceptContactInvitationStep}
        disabled={processStep !== "default"}
        loading={processStep === "addingContact"}
      >
        Add contact
      </Button>
    </ScrollScreenContainer>
  );
}