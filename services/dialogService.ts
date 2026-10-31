export type HalakatDialogButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

export type HalakatDialogConfig = {
  title: string;
  message?: string;
  buttons?: HalakatDialogButton[];
};

type DialogListener = (dialog: HalakatDialogConfig | null) => void;

let listener: DialogListener | null = null;

export function subscribeToHalakatDialog(nextListener: DialogListener) {
  listener = nextListener;
  return () => {
    if (listener === nextListener) listener = null;
  };
}

export function showHalakatDialog(title: string, message?: string, buttons?: HalakatDialogButton[]) {
  listener?.({
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: 'OK', style: 'default' }],
  });
}
