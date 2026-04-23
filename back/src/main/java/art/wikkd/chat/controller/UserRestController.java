package art.wikkd.chat.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import art.wikkd.chat.dto.SenderSummaryDto;
import art.wikkd.chat.entity.User;
import art.wikkd.chat.service.UserService;
import art.wikkd.chat.exception.ChatException;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<User> getUserByUuid(@PathVariable("uuid") UUID uuid) {
        try{
            User user = userService.getUserByUuid(uuid);
            return ResponseEntity.ok(user);
        } catch (ChatException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<SenderSummaryDto> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new SenderSummaryDto(userService.getUserById(id)));
    }

    @PostMapping("/register/{username}")
    public ResponseEntity<UUID> createUser(@PathVariable("username") String username) {
        return ResponseEntity.ok(userService.createUser(username));
    }
}
