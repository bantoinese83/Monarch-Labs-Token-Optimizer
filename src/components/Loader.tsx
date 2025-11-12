import { AnimatedLoader } from './AnimatedLoader';
import { DEFAULT_LOADER_TYPE } from '@/constants';

export function Loader() {
  return <AnimatedLoader type={DEFAULT_LOADER_TYPE} />;
}
