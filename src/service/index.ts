import csvService from './csv';
import sysService from './sys';
import relationship from './relationship';
import BPARelationship from './BPA-relationship';

export default {
  ...csvService,
  ...sysService,
  ...relationship,
  ...BPARelationship,
};
