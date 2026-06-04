#/bin/sh

srcDir=../../node
tgtDir=../nodejs

srcs=$(cd ${srcDir}/lib && find . -name \*.js)

for n in ${srcs} 
do
	src=${srcDir}/lib/${n}
	tgt=${tgtDir}/${n}
	dn=$(dirname ${tgt})
	if [ ! -d ${dn} ]; then mkdir ${dn}; fi
	echo "${src} -> ${tgt}"
	npx babel ${src} > ${tgt}
done
