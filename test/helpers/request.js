'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import supertest from 'supertest-as-promised';
import {app} from '../../app';

export default supertest.agent(app);
