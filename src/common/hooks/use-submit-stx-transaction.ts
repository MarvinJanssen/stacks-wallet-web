import {
  broadcastTransaction,
  StacksTransaction,
  TxBroadcastResultRejected,
} from '@stacks/transactions';
import { useDoChangeScreen } from '@common/hooks/use-do-change-screen';
import { useWallet } from '@common/hooks/use-wallet';
import { useLoading } from '@common/hooks/use-loading';
import { useRecoilValue } from 'recoil';
import { stacksNetworkStore } from '@store/recoil/networks';
import { useCallback } from 'react';
import { ScreenPaths } from '@store/onboarding/types';
import { useRevalidateApi } from '@common/hooks/use-revalidate-api';
import { toast } from 'react-hot-toast';

function getErrorMessage(
  reason: TxBroadcastResultRejected['reason'] | 'ConflictingNonceInMempool'
) {
  switch (reason) {
    case 'ConflictingNonceInMempool':
      return 'Nonce conflict, try again soon.';
    case 'BadNonce':
      return 'Incorrect nonce.';
    case 'NotEnoughFunds':
      return 'Not enough funds.';
    case 'FeeTooLow':
      return 'Fee is too low.';
    default:
      return 'Something went wrong';
  }
}

export function useHandleSubmitTransaction({
  transaction,
  onClose,
  loadingKey,
}: {
  transaction: StacksTransaction | null;
  onClose: () => void;
  loadingKey: string;
}) {
  const doChangeScreen = useDoChangeScreen();
  const { doSetLatestNonce } = useWallet();
  const { setIsLoading, setIsIdle } = useLoading(loadingKey);
  const stacksNetwork = useRecoilValue(stacksNetworkStore);
  const revalidate = useRevalidateApi();

  return useCallback(async () => {
    setIsLoading();
    if (transaction) {
      try {
        const response = await broadcastTransaction(transaction, stacksNetwork);
        if (typeof response !== 'string') {
          toast.error(getErrorMessage(response.reason));
        } else {
          await doSetLatestNonce(transaction);
          await revalidate();
          toast.success('Transaction submitted!');
        }
      } catch (e) {
        toast.error('Something went wrong');
      }
    }
    onClose();
    setIsIdle();
    doChangeScreen(ScreenPaths.HOME);
  }, [
    revalidate,
    doChangeScreen,
    doSetLatestNonce,
    setIsLoading,
    transaction,
    stacksNetwork,
    onClose,
    setIsIdle,
  ]);
}
