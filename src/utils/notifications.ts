import { exec } from "child_process";
import { config } from "./config";

export const playSound = (): void => {
  if (config.get("isMuted")) return;
  const platform = process.platform;

  if (platform === "linux") {
    exec(
      "paplay /usr/share/sounds/freedesktop/stereo/complete.oga || aplay /usr/share/sounds/alsa/Front_Center.wav",
      (err) => {
        if (err) {
          process.stdout.write("\u0007");
        }
      },
    );
  } else if (platform === "darwin") {
    exec("afplay /System/Library/Sounds/Glass.aiff", (err) => {
      if (err) {
        process.stdout.write("\u0007");
      }
    });
  } else if (platform === "win32") {
    // TODO:  make sure that this part is safe - i am not sure about this solution
    exec(
      "powershell -c \"(New-Object Media.SoundPlayer 'C:\\Windows\\Media\\notify.wav').PlaySync()\"",
      (err) => {
        if (err) {
          process.stdout.write("\u0007");
        }
      },
    );
  } else {
    process.stdout.write("\u0007");
  }
};

export const sendNotification = (title: string, message: string): void => {
  if (config.get("isMuted")) return;
  const platform = process.platform;
  const escapedMessage = message.replace(/"/g, '\\"');
  const escapedTitle = title.replace(/"/g, '\\"');

  if (platform === "linux") {
    exec(`notify-send "${escapedTitle}" "${escapedMessage}"`);
  } else if (platform === "darwin") {
    exec(
      `osascript -e 'display notification "${escapedMessage}" with title "${escapedTitle}"'`,
    );
  } else if (platform === "win32") {
    // TODO: same aswell, not sure if executing the powershell with this kind of huge value is a good and proper way
    // maybe we could execute it in a different way? or we could execute any "alarm" sound insted?
    // other solution is provide the "default" sound. we could consider it.
    const winCmd = `powershell -c "[void] [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); $objNotification = New-Object System.Windows.Forms.NotifyIcon; $objNotification.Icon = [System.Drawing.SystemIcons]::Information; $objNotification.BalloonTipIcon = 'Info'; $objNotification.BalloonTipText = '${escapedMessage}'; $objNotification.BalloonTipTitle = '${escapedTitle}'; $objNotification.Visible = $True; $objNotification.ShowBalloonTip(5000)"`;
    exec(winCmd);
  }
};

export const notifyUser = (title: string, message: string): void => {
  sendNotification(title, message);
  playSound();
};
