package art.wikkd.chat.repository;

import art.wikkd.chat.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUuid(UUID uuid);

	Optional<User> findById(Long id);
}
