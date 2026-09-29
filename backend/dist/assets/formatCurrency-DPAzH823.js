function i(r,t="USD",n="en-US"){const m=Number(r||0);return new Intl.NumberFormat(n,{style:"currency",currency:t,minimumFractionDigits:0,maximumFractionDigits:2}).format(m)}export{i as f};
