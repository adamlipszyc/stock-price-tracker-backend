
const delay = (ms) => {

    return new Promise((resolve, reject) => {
        let i = 0;
        while(i < 100000000) {i++}
        resolve();
    })

}

const basic = async (fruit) => {

    const fruits = {
        apple: "A",
        banana: "B",
        pineapple: "C"
    };

    await delay(1);

    console.log("HERE");

    return fruits[fruit];

}

const main = async () => {
    const start = Date.now();
    const a = basic("apple");
    a.then((a) => console.log(a));
    console.log(a);
    const middle = Date.now();
    const b = basic("banana");
    console.log(b);
    const end = Date.now();

    

    b.then((b) => console.log(b));
    
    console.log(middle - start);
    console.log(end - start);
    
 
    console.log("done");
}

main();
