import csvService from './csv';
import sysService from './sys';
import relationship from './relationship';

export default {
  ...csvService,
  ...sysService,
  ...relationship,
};
