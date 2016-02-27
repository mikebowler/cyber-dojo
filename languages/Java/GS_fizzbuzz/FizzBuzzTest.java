import org.junit.*;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class HikerTest {

    @Test
    public void RunFizzBuzz() {
    	for( int i=1; i <= 100; i++ ) {
            System.out.println("At "+i+", result="+FizzBuzz.convert(i));
    	}
    }
}
