# Dino
![labossl_programming_language_logo_for_a_language_called_DinoScr_a7db8f2d-1ad2-474e-b542-e8cb4eecb47f](https://github.com/yuevan10284/Dino-Programming-Language/assets/92699280/eb072034-9c9c-4802-b64e-6184a95a2b4f)

# Dino Website
https://anthony29m.github.io

# Introduction
In the primordial landscape of programming languages, where the echoes of innovation reverberated through the binary canyons, a language emerged with the thunderous roar of prehistoric beasts and the finesse of ancient civilizations. Behold Dino, a programming language that transcends the ordinary, weaving a narrative of code that echoes the majesty of a time long before algorithms ruled the world. Every line of Dino code is an expedition into the untamed wilderness of creativity, where developers embark on a journey reminiscent of a Jurassic odyssey. This language, curated by the visionary minds of coding pioneers, channels the raw power of dinosaurs into its expressive syntax, turning each program into a thrilling adventure that leaves an indelible mark on the digital terrain.

## 🔗 Developers
* [@Owen Hunger](https://github.com/ohunger)
* [@Evan Yu](https://github.com/yuevan10284)
* [@Anthony Mendizabal](https://github.com/Anthony29M)
* [@Brandan Bazile](https://github.com/bbazile)

## Features
* Dino Expressions: Channel the raw power of dinosaurs into your code with expressive syntax.
* Fossilized Functions: Define functions that transcend the temporal boundaries, ensuring the endurance and discoverability of your code.
* T-Rex Types: Immerse yourself in the world of strongly typed variables, fortified with the fierceness of a T-Rex. Dino's type system guarantees the creation of robust and reliable programs, ensuring that your code stands tall and unyielding, just like the legendary predator that inspired it.
* Stegosaurus Scoping: Navigate the coding landscape with the protective prowess of a Stegosaurus's spiked tail. Embrace static scoping in Dino, where variables are shielded within their designated domains, ensuring a secure and well-defined environment for your code to flourish.
* Dinos are simple! Mix of JS and python, not parenthesis in if/while/for statements, but does have brackets where it makes sense.
* Dinos roar forever! String concatenation.
* Dino Style prevails all


### Other Notes/Constraints
* Identifiers have to be declared before they are used. The Dino comes from an egg first!
* Usage of identifiers without initialization is forbidden, mirroring the disciplined order observed in the prehistoric world.
* Uniqueness reigns supreme, as identifiers must be singular within their scope, mirroring the individuality of each species in the coding ecosystem.
* Access modifiers, the guardians of code privacy, dictate the visibility of identifiers, ensuring a harmonious coexistence within the Dino kingdom.
* Variable assignments adhere to a stringent rule – only variables of the same type may be interlinked. A deviation from this rule invokes the wrath of errors, maintaining the harmony of variable types. I.E. int x = "hello"  throws Error.  or assigning a previously declared string variable to a previously declared int variable.
* Arguments/Calls must match up with number of parameters. Explicit declarations bind them in a symbiotic relationship, harmonizing the elements of Dino code. Explicitly you must say xyz( first = 150 , second = 250)  as opposed to xyz(150,250)
* The primal commands of 'break' and 'continue' are restricted to the rhythmic beats of loops, echoing the cyclical nature of the prehistoric dance of life.
* The command 'return' finds its sanctuary solely within the confines of a function.
* Declared variables, akin to ancient relics, must be respected and acknowledged, their presence acknowledged by usage or reading, safeguarding the balance between creation and utilization in the Dino realm.
* Cannot have non-boolean value in a conditional or while loop.
* For loops only take integer values.

## Example Dino Actions

### Printing

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>

```javascript
console.log(“Hello world!”)
```

</td>

<td>

```
rawr "ROARR, dino angry. I hate comet"
```

</td>
</table>

### Assigning variables

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>

```javascript
var myNumber = 42;
var myString = "Hello, World!";
```

</td>

<td>

```
dinum eggs = 0
stegostring dinoMessage = "roar, world"
```

</td>
</table>

### if-statements

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>
    
```javascript
if (x > 5) {
  return 1;
} else if (x < 3) {
  return -1;
} else {
  return 0;
}
```
</td>
<td>
    
```
if-rex x > 5 {
  hatch 1
} t-else x < 3 {
  hatch -1
} t-rex {
  hatch 0
} 
```
</td>
</table>

### Loops

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>
    
```javascript
while(true){
    continue;
}
```
</td>
<td>
    
```
roaring hit {
    keepStomping
}
```
</td>
</table>


### Comments

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td> 
    
```javascript
// insert Dinolicious comment.
```
</td>
<td>
    
```
🦖 insert Dinoscrumptious comment.
```
</td>
</table>


### Function Declarations

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>
    
```javascript
function evenOrOdd(x){
    return x % 2 > 0
}
```
</td>
<td>
    
```
quest evenOrOdd(dinum x){
    hatch x % 2 > 0
}
```
</td>
</table>

<table>
<tr> <th>JavaScript</th><th>Dino</th><tr>
</tr>
<td>
    
```javascript
function subtract(a, b){
    return a - b;
}
let c = subtract(a,b);
```
</td>
<td>
    
```
quest subtract(dinum a, dinum b){ 
   hatch a - b
}
dinum c = subtract(10, 5)
```
</td>
</table>
