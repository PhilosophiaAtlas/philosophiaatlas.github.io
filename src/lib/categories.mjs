import {createHash} from 'node:crypto';
export function categoryId(label){const slug=label.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'category';return slug+'-'+createHash('sha256').update(label).digest('hex').slice(0,10);}
export const categoryHref=label=>'/category/'+categoryId(label)+'/';
