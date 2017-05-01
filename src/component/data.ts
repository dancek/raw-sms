import * as m from 'mithril';

import {OperatorLogo} from '../sms';

interface LogoAttrs extends m.Attributes {
    logo: OperatorLogo;
}

// FIXME: types
export class DataComponent implements m.Component<LogoAttrs, any> {
    view(vnode: m.Vnode<LogoAttrs, any>) {
        const logo = vnode.attrs.logo;
        const data = {
            mcc: logo.mcc,
            mnc: logo.mnc,
            data: logo.toBase64(),
        };
        return m('pre', JSON.stringify(data, null, 2));
    }
}
