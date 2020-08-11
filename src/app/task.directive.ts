import { Directive, ElementRef, HostListener, Input, Renderer2, ViewChild } from '@angular/core'; // we import a lot extra here, is required for the functionality

@Directive({
  selector: '[taskDirective]'
})

// The following details the behaviour we are applying to every task object. When the user hovers their mouse over one, I want something to happen (also implement click functionality later)
export class TaskDirective {
  @ViewChild('taskDescription') taskDescription: ElementRef;

  constructor(private _elRef: ElementRef, private _renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    //console.log("test mouse enter");
    this.border('lime', 'solid', '10px');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.border(); // set border to nothing when mouse leaves
  }

  @HostListener('click') onMouseClick(){
    this.border('blue', 'solid', '10px');
    //this._renderer.setStyle(this._elRef.nativeElement, 'visibility', 'hidden'); // this sets the whole thing to hidden
    //this.taskDescription.nativeElement.value = "test!";
    //console.log("testing visibility change");
    // we want to display the rest of the task elements when clicked
    // how do we get the objects attributes?

  }

  ngAfterViewInit() {
    // still wouldn't work!! wtf!!!
   // console.log("this is the task description: " + this.taskDescription.nativeElement);
  }



  // what the hell does everything below even do?
  private border(
    color: string = null,
    type: string = null,
    width: string = null
  ){
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-color', color
    );
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-style', type
    );
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-width', width
    );
  }
}
