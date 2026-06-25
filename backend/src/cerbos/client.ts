import { HTTP as Cerbos } from '@cerbos/http';
import { config } from '../config/index.js';

export const cerbos = new Cerbos(config.cerbosUrl);
