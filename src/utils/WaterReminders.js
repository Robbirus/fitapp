import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WATER_REMINDER_PREFIX = "water-reminder-";

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelWaterReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.identifier?.startsWith(WATER_REMINDER_PREFIX));
  await Promise.all(
    toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function scheduleWaterReminders({ start, end, intervalHours }) {
  await cancelWaterReminders();

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const stepMinutes = Math.max(intervalHours, 0.5) * 60;

  const slots = [];
  for (let t = startMinutes; t <= endMinutes; t += stepMinutes) {
    slots.push(Math.round(t));
  }

  await Promise.all(
    slots.map((minutesOfDay) => {
        const hour = Math.floor(minutesOfDay / 60);
        const minute = minutesOfDay % 60;
        return Notifications.scheduleNotificationAsync({
            identifier: `${WATER_REMINDER_PREFIX}${hour}-${minute}`,
            content: {
                title: "💧 Pense à boire de l'eau",
                body: "Un petit verre d'eau, ça fait du bien.",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    }),
  );

  return slots.length;
}

export async function disableWaterReminders() {
  await cancelWaterReminders();
}