# Java Programming --- Extended Lecture

## 1. Introduction to Java

Java is a general-purpose, class-based, object-oriented programming
language. It was designed to make application development portable
across different operating systems and hardware platforms.

A central idea behind Java is **Write Once, Run Anywhere**. Java source
code is compiled into bytecode, which can run on any device that has a
compatible Java Virtual Machine (JVM).

### Learning objectives

After this lecture, you should be able to:

-   Explain the difference between source code, bytecode and machine
    code.
-   Describe the role of the Java Development Kit (JDK) and JVM.
-   Declare variables and choose appropriate data types.
-   Use conditions, loops and methods.
-   Explain basic object-oriented programming concepts.

> Remember: the JVM executes bytecode. The JDK includes tools needed to
> develop Java applications.

## 2. The Java Platform: JDK, JRE and JVM

These three terms are related, but they do not mean the same thing.

  -----------------------------------------------------------------------
  Component               Main purpose            Typical contents
  ----------------------- ----------------------- -----------------------
  JVM                     Executes Java bytecode  Runtime engine, memory
                                                  management

  JRE                     Runs Java applications  JVM and runtime
                                                  libraries

  JDK                     Develops Java           JRE components,
                          applications            compiler and developer
                                                  tools
  -----------------------------------------------------------------------

The compilation process can be represented as follows:

``` mermaid
flowchart TD
    A[Java source file .java] --> B[Java compiler javac]
    B --> C[Bytecode .class]
    C --> D[Java Virtual Machine]
    D --> E[Program execution]
```

For example, a source file named `Main.java` is compiled with:

``` bash
javac Main.java
```

The compiler creates `Main.class`. You can then run the program:

``` bash
java Main
```

## 3. Your First Java Program

A minimal Java application can look like this:

``` java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

Let's examine the important parts:

1.  `public` is an access modifier.
2.  `class Main` declares a class named `Main`.
3.  `main` is the entry point used to start this application.
4.  `System.out.println` prints a line of text to the console.

Java is case-sensitive. This means `Main`, `main` and `MAIN` are three
different identifiers.

### Try to predict the output

``` java
System.out.println("Java");
System.out.println("Programming");
System.out.println(2026);
```

The output is:

``` text
Java
Programming
2026
```

## 4. Variables and Data Types

A variable is a named storage location. Every variable has a type, a
name and a value.

``` java
int age = 20;
double temperature = 21.5;
boolean isStudent = true;
char grade = 'A';
String firstName = "Alex";
```

### Primitive data types

  Type        Example         Description
  ----------- --------------- --------------------------
  `int`       `42`            Whole numbers
  `long`      `9000000000L`   Large whole numbers
  `double`    `3.14159`       Decimal numbers
  `float`     `2.5f`          Single-precision decimal
  `boolean`   `true`          True or false
  `char`      `'J'`           One character

`String` is not a primitive type. It is a class provided by the Java
platform.

### Constants

Use `final` when a variable should not be reassigned:

``` java
final double PI = 3.141592653589793;
```

Trying to assign a new value to `PI` later will cause a compilation
error.

## 5. Operators and Expressions

Java provides arithmetic, comparison and logical operators.

  Category     Operators           Example
  ------------ ------------------- -------------------------
  Arithmetic   `+ - * / %`         `10 % 3`
  Comparison   `== != > < >= <=`   `age >= 18`
  Logical      `&& || !`           `isStudent && age > 18`
  Assignment   `= += -= *=`        `counter += 1`

Integer division discards the fractional part:

``` java
System.out.println(7 / 2);     // 3
System.out.println(7.0 / 2);   // 3.5
System.out.println(7 % 2);     // 1
```

### A mathematical example

The area of a circle is calculated using:

$$
A = \pi r^2
$$

If the radius is 4, then:

$$
A = \pi \cdot 4^2 = 16\pi \approx 50.27
$$

Java implementation:

``` java
double radius = 4.0;
double area = Math.PI * radius * radius;

System.out.println(area);
```

## 6. Conditional Statements

A conditional statement allows a program to choose between different
execution paths.

``` java
int score = 82;

if (score >= 90) {
    System.out.println("Excellent");
} else if (score >= 70) {
    System.out.println("Good");
} else if (score >= 50) {
    System.out.println("Pass");
} else {
    System.out.println("Try again");
}
```

The `switch` statement is useful when one expression is compared with
several possible values:

``` java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Another day");
}
```

## 7. Loops

Loops repeat a block of code while a condition is satisfied or for a
specified number of iterations.

### The `for` loop

``` java
for (int i = 1; i <= 5; i++) {
    System.out.println("Iteration: " + i);
}
```

### The `while` loop

``` java
int count = 3;

while (count > 0) {
    System.out.println(count);
    count--;
}
```

### The `do-while` loop

A `do-while` loop executes its body at least once because the condition
is checked after the body.

``` java
int number = 1;

do {
    System.out.println(number);
    number++;
} while (number <= 3);
```

### Loop flow

``` mermaid
flowchart TD
    A[Start] --> B{Condition true?}
    B -->|Yes| C[Execute loop body]
    C --> B
    B -->|No| D[Continue program]
```

## 8. Methods

A method is a named block of code that performs a task. Methods help
divide a program into smaller, reusable parts.

``` java
public static int add(int first, int second) {
    return first + second;
}

public static void main(String[] args) {
    int result = add(5, 7);
    System.out.println(result);
}
```

In this example:

-   `public` defines visibility.
-   `static` means the method belongs to the class.
-   `int` is the return type.
-   `add` is the method name.
-   `first` and `second` are parameters.
-   `return` sends a result back to the caller.

A method with return type `void` does not return a value.

## 9. Object-Oriented Programming

Object-oriented programming (OOP) organizes software around objects. An
object combines state (fields) and behaviour (methods).

A class is a blueprint from which objects can be created.

``` java
public class Student {
    private String name;
    private int year;

    public Student(String name, int year) {
        this.name = name;
        this.year = year;
    }

    public void introduce() {
        System.out.println("My name is " + name);
    }
}
```

Create and use an object:

``` java
Student student = new Student("Alex", 2);
student.introduce();
```

### Four common OOP principles

1.  **Encapsulation** --- keeping data and related methods together,
    while controlling access to internal state.
2.  **Inheritance** --- creating a class based on another class.
3.  **Polymorphism** --- allowing one interface or parent type to
    represent different implementations.
4.  **Abstraction** --- exposing essential behaviour while hiding
    implementation details.

## 10. Arrays

An array stores a fixed number of values of the same type.

``` java
int[] numbers = {4, 8, 15, 16, 23, 42};

System.out.println(numbers[0]); // 4
System.out.println(numbers.length); // 6
```

Array indexes start at zero. Accessing an index outside the valid range
causes an `ArrayIndexOutOfBoundsException`.

You can process an array with a loop:

``` java
int sum = 0;

for (int number : numbers) {
    sum += number;
}

System.out.println("Sum: " + sum);
```

## 11. Exceptions and Error Handling

An exception is an event that interrupts the normal flow of a program.
Java provides `try`, `catch` and `finally` to handle many exceptional
situations.

``` java
try {
    int result = 10 / 0;
    System.out.println(result);
} catch (ArithmeticException exception) {
    System.out.println("Division by zero is not allowed.");
} finally {
    System.out.println("This block is executed at the end.");
}
```

Do not use exception handling to hide every programming error. Validate
input and handle only situations your application can reasonably recover
from.

## 12. Summary and Knowledge Check

In this lecture, we covered the Java platform, basic syntax, variables,
operators, conditions, loops, methods, objects, arrays and exceptions.

### Check your understanding

1.  What is the role of the JVM?
2.  What is the difference between `int` and `double`?
3.  Why does an array index start at zero?
4.  When would you use a `while` loop instead of a `for` loop?
5.  What problem does encapsulation help solve?

### Mini exercise

Write a Java method that receives an integer and returns `true` if the
number is even.

```{=html}
<details>
```
```{=html}
<summary>
```
Hint
```{=html}
</summary>
```
Use the remainder operator `%`. A number is even when dividing it by 2
leaves remainder zero.

```{=html}
</details>
```
### Final formula

The general structure of a simple Java application can be summarized as:

$$
\text{Input} \rightarrow \text{Processing} \rightarrow \text{Output}
$$

Keep practising by modifying the examples and predicting their output
before running them.
