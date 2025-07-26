Blah blah blah...



### Self-Signed Certificates

Need: ssl.crt – the public certificate in PEM format

#### Windows

1. Press Windows + R, type `certmgr.msc`, and press Enter.
2. In the left panel, expand: **Trusted Root Certification Authorities** → **Certificates**.
3. Right-click **Certificates**, then choose: **All Tasks → Import...**
4. Browse to your `ssl.crt` file.
5. Choose "Place all certificates in the following store" → make sure it’s set to **Trusted Root Certification Authorities**.
6. Finish and confirm any security prompt.

#### macOS

1. Open the **Keychain Access** app.
2. In the left sidebar, select **System** under **Keychains**.
3. Select **Certificates** under **Category**.
4. From the top menu, choose **File → Import Items...**
5. Select your `ssl.crt` file, confirm import into the System keychain.
6. You will be prompted for your macOS password to authorize the change.
7. After importing, double-click the certificate entry.
8. In the popup window, expand the **Trust** section.
9. Set "When using this certificate" to **Always Trust**.
10. Close the window, and enter your password again if prompted.

#### Linux

**Debian/Ubuntu:**

1. `sudo cp ssl.crt /usr/local/share/ca-certificates/opsrocket.crt`
2. `sudo update-ca-certificates`

**RedHat/CentOS/Fedora:**

1. `sudo cp ssl.crt /etc/pki/ca-trust/source/anchors/opsrocket.crt`
2. `sudo update-ca-trust extract`

**Note:** This does not affect Firefox unless it’s configured to use system trust (by default, it has its own CA store).
