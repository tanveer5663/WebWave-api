import { initializeApp, getApps, cert } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";
const privatKey =
  "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCSw1+lVWnLHP8y\nKzlDVJEdLTPl45cTO1W+tpJo+uM69WYK8Xh2Xihh/3j+G9jHyg7Q29Ta+6raOwGP\nb9Uwx/rN8YWxUx8AJvzBnqkHhaeB/7ShZhNs1RRsS6f5LgBlRrKTa/+HBGpVezI4\nZ2ugEMI/O6Lyffn30T7aS4mmXV4zX9bB0WR4ts5bbo3js401Hco87sBD1eYbNgCr\nRjJsWnVn6auEldTIbZfAOTLfx7bU8GWmo5EntaxLRz0s1dAoiea0orHOjeuP126o\nZhSPiD2LaceuurRixQ0mEEPKWZeN+6yTKbBFuJJBjfFTDucnj9EZjSm6S5KciFP6\nMTwOEiQXAgMBAAECgf82LspO6oHv0DRZ9VmXw6DjMc0K6whlWXVvXG4t6sDy3AJa\nL08pG+jGOCjB9ox7AafmONmk618hz/xadPxNYgqLh5jao4aZ6kEKj9ejFq5lDoWu\ngChc/x/TUaUAwrLFJ0eLWjmZ7gdhBGleqyvIlx8ftetEvCn2C8B9+ALZqmO6UZu1\nBgt39rdgFPetVnt5W/cByqunR3LF4agy4YFMlAs7w+RZa2VD2GOkJjLik30fZcpd\nnv2czfFzkpjUPEwbYT2ArA3Cyu43Ol7aLQnuyErJSsldNFWAMeS6MKlJbsB7Zp7N\nPEy1MPIVkirzQH1EZbYxPlTunBZeTp/nM3RgKcECgYEAyoRcf5CYQAhQd+SabaEw\nekIY2f505qRvjM7o/otKGdh9haL1WP6JnVzR9Mq68rch3s+x+0VFdEIQv8s1ARTg\n/XZgCzEWuiTFJnxnsTIYtBqeo0G/I44YcbUtcJzLETRVWXF/x6ojrt7lC43sBtep\nkSWaIkARjx0IFzQIfixRVpECgYEAuYWkYHK47tjxQ4PlkytYQqAYnQss+wRT8TZx\n3j5SCHMvu3LXNVDgv1sjeV7ucd4mM7i6hGABvluBXd+U3kMRML/00OtSCeCSSpf4\nSy3b96YCMaZf1rvn5KVN6Lxfm/j5vLSZCPyqYoAY3bDmcXMkDMRbdFHBdjj6+l00\nENfQtCcCgYBdJgRlqFxfF3PrsXpWco2Zrk0/94pNi9TDL2h7rBWpTapujUXMaUdi\n2g64SYcznIg3s9BpgrMvhjOuBAmdNb1G1+vVOf76H2+PBCmtlx1Fufi9nsAL2o/j\nvTHpWjUM9MVNHqdnbxp6lItFhUHK4+dam7EJj+6DpRbTlVtSrY+8AQKBgBo0Z1B8\nQ+Tw3btEoSPVhoT6qh9cmcDnDphOsWzL7rhk1MQsZ3uPbf95dxxIrXOGBm1d1XKn\nQPfLYw2IbDWs0XvKUWFFK/RbNS62Iosz8hMb7slmj7j8F7gzJTsPiI22cEgYVllv\nnv2EzH5b42D4+4mWHrjiZ2o0iDbe/WC3qzIXAoGAMbU7qdQf9DLnZS/gsUW+eEJ1\nIx9YZxupxS2aOYM+5ujYORk7mm/HWw4zI8vga9mDXs7BpZzQgPe10kGAvx44U4ks\nsPPkMrGdTZaQ2X3nUBjDmIRk0wXuE9jP46Ea0irY2GSXEIOV0iCsNRaXTT8YILDF\n0xE0dynqf6g4ewR0M6w=\n-----END PRIVATE KEY-----\n";
// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: "web-wave-8c8a9",
        clientEmail:
          "firebase-adminsdk-fbsvc@web-wave-8c8a9.iam.gserviceaccount.com",
        // Replace newlines in the private key
        privateKey: privatKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  return {
    db: getFirestore(),
  };
}

export const { db } = initFirebaseAdmin();
